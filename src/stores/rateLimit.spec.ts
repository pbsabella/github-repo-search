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
})
