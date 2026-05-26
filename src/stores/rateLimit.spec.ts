import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRateLimitStore } from '@/stores/rateLimit'

const headers = (resource: string, remaining: number, limit = 60) => ({
  'x-ratelimit-resource': resource,
  'x-ratelimit-remaining': String(remaining),
  'x-ratelimit-limit': String(limit),
  'x-ratelimit-reset': '1700000000',
})

describe('useRateLimitStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('defaults', () => {
    it('both pools start at zero with no data', () => {
      const store = useRateLimitStore()

      expect(store.search.limit).toBe(0)
      expect(store.search.remaining).toBe(0)
      expect(store.search.hasData).toBe(false)
      expect(store.search.isLow).toBe(false)
      expect(store.search.isEmpty).toBe(false)

      expect(store.core.limit).toBe(0)
      expect(store.core.remaining).toBe(0)
      expect(store.core.hasData).toBe(false)
      expect(store.core.isLow).toBe(false)
      expect(store.core.isEmpty).toBe(false)
    })
  })

  describe('update() routing', () => {
    it('routes search headers to the search pool only', () => {
      const store = useRateLimitStore()
      store.update(headers('search', 42, 30))

      expect(store.search.remaining).toBe(42)
      expect(store.search.limit).toBe(30)
      expect(store.core.remaining).toBe(0)
      expect(store.core.limit).toBe(0)
    })

    it('routes core headers to the core pool only', () => {
      const store = useRateLimitStore()
      store.update(headers('core', 4999, 5000))

      expect(store.core.remaining).toBe(4999)
      expect(store.core.limit).toBe(5000)
      expect(store.search.remaining).toBe(0)
      expect(store.search.limit).toBe(0)
    })

    it('leaves both pools unchanged for an unknown resource', () => {
      const store = useRateLimitStore()
      store.update(headers('graphql', 100))

      expect(store.search.hasData).toBe(false)
      expect(store.core.hasData).toBe(false)
    })

    it('leaves both pools unchanged when resource header is missing', () => {
      const store = useRateLimitStore()
      store.update({})

      expect(store.search.hasData).toBe(false)
      expect(store.core.hasData).toBe(false)
    })

    it('only updates the fields present in the headers', () => {
      const store = useRateLimitStore()
      store.update({ 'x-ratelimit-resource': 'search', 'x-ratelimit-remaining': '7' })

      expect(store.search.remaining).toBe(7)
      expect(store.search.limit).toBe(0)
      expect(store.search.resetAt).toBe(0)
    })

    it('updates resetAt when provided', () => {
      const store = useRateLimitStore()
      store.update(headers('core', 100))

      expect(store.core.resetAt).toBe(1700000000)
    })
  })

  describe('search pool thresholds', () => {
    it('isLow is true when remaining < 5', () => {
      const store = useRateLimitStore()
      store.update(headers('search', 4))

      expect(store.search.isLow).toBe(true)
    })

    it('isLow is false when remaining >= 5', () => {
      const store = useRateLimitStore()
      store.update(headers('search', 5))

      expect(store.search.isLow).toBe(false)
    })

    it('isEmpty is true when remaining is 0', () => {
      const store = useRateLimitStore()
      store.update(headers('search', 0))

      expect(store.search.isEmpty).toBe(true)
    })
  })

  describe('core pool thresholds', () => {
    it('isLow is true when remaining < 10', () => {
      const store = useRateLimitStore()
      store.update(headers('core', 9))

      expect(store.core.isLow).toBe(true)
    })

    it('isLow is false when remaining >= 10', () => {
      const store = useRateLimitStore()
      store.update(headers('core', 10))

      expect(store.core.isLow).toBe(false)
    })

    it('isEmpty is true when remaining is 0', () => {
      const store = useRateLimitStore()
      store.update(headers('core', 0))

      expect(store.core.isEmpty).toBe(true)
    })
  })

  describe('concurrent updates (race condition prevention)', () => {
    it('allows remaining to increase when reset window changes', () => {
      const store = useRateLimitStore()
      const now = Math.floor(Date.now() / 1000)
      const headersOldWindow = {
        ...headers('core', 1, 60),
        'x-ratelimit-reset': String(now - 1),   // already expired
      }
      const headersNewWindow = {
        ...headers('core', 60, 60),
        'x-ratelimit-reset': String(now + 3600), // new future window
      }

      store.update(headersOldWindow)
      expect(store.core.remaining).toBe(1)

      store.update(headersNewWindow)
      expect(store.core.remaining).toBe(60)
    })

    it('handles out-of-order concurrent responses correctly (race condition prevention)', () => {
      const store = useRateLimitStore()
      const futureReset = String(Math.floor(Date.now() / 1000) + 3600)
      const reqSentFirst = {
        ...headers('core', 58, 60),
        'x-ratelimit-reset': futureReset,
      }
      const reqSentSecond = {
        ...headers('core', 57, 60),
        'x-ratelimit-reset': futureReset,
      }

      store.update(reqSentSecond)
      expect(store.core.remaining).toBe(57)

      store.update(reqSentFirst)
      expect(store.core.remaining).toBe(57)
    })

    it('handles concurrent responses with slightly different reset times', () => {
      const store = useRateLimitStore()
      const now = Math.floor(Date.now() / 1000)
      const req1 = {
        ...headers('core', 4994, 5000),
        'x-ratelimit-reset': String(now + 3600),
      }
      const req2 = {
        ...headers('core', 4997, 5000),
        'x-ratelimit-reset': String(now + 3825), // 225s later — same window, different server clock
      }

      store.update(req1)
      expect(store.core.remaining).toBe(4994)

      // Higher remaining from a slightly different reset time must not overwrite the lower value
      store.update(req2)
      expect(store.core.remaining).toBe(4994)
    })

    it('a delayed old-window response does not overwrite data already set by the new window', () => {
      const store = useRateLimitStore()
      const now = Math.floor(Date.now() / 1000)
      const newWindowHeaders = { ...headers('core', 59, 60), 'x-ratelimit-reset': String(now + 3590) }
      const oldWindowHeaders = { ...headers('core', 2, 60), 'x-ratelimit-reset': String(now - 10) }

      store.update(newWindowHeaders)
      expect(store.core.remaining).toBe(59)
      expect(store.core.resetAt).toBe(now + 3590)

      store.update(oldWindowHeaders)
      expect(store.core.remaining).toBe(59)       // must not drop back to 2
      expect(store.core.resetAt).toBe(now + 3590) // must not be pushed back into the past
    })

    it('a response from before an idle period does not corrupt the store after the window resets', () => {
      const store = useRateLimitStore()
      const now = Math.floor(Date.now() / 1000)
      // State just before the user went idle: 5 remaining, window already expired
      store.update({ ...headers('core', 5, 60), 'x-ratelimit-reset': String(now - 1) })

      // A request sent before the idle period finally arrives — its reset time is in the past
      store.update({ ...headers('core', 4, 60), 'x-ratelimit-reset': String(now - 1) })
      expect(store.core.remaining).toBe(5) // stale value must not overwrite

      // Coming back from idle and searching works fine — the new window has a future reset time
      store.update({ ...headers('core', 10, 60), 'x-ratelimit-reset': String(now + 3599) })
      expect(store.core.remaining).toBe(10) // fresh new-window data is accepted normally
    })

    it('the reset time only ever moves forward, never backward', () => {
      const store = useRateLimitStore()
      const now = Math.floor(Date.now() / 1000)

      store.update({ ...headers('core', 50, 60), 'x-ratelimit-reset': String(now + 3600) })
      expect(store.core.resetAt).toBe(now + 3600)

      store.update({ ...headers('core', 49, 60), 'x-ratelimit-reset': String(now + 3825) })
      expect(store.core.resetAt).toBe(now + 3825)

      // A response with an older reset time is dropped — the clock does not rewind
      store.update({ ...headers('core', 48, 60), 'x-ratelimit-reset': String(now + 3600) })
      expect(store.core.resetAt).toBe(now + 3825)
      expect(store.core.remaining).toBe(49) // the dropped update must not touch remaining either
    })
  })
})
