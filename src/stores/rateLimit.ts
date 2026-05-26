import { reactive } from 'vue'
import { defineStore } from 'pinia'

const createPool = (lowThreshold: number) => {
  return reactive({
    limit: 0,
    remaining: 0,
    resetAt: 0,
    get hasData() {
      return this.limit > 0
    },
    get isLow() {
      return this.hasData && this.remaining < lowThreshold
    },
    get isEmpty() {
      return this.hasData && this.remaining === 0
    },
  })
}

export const useRateLimitStore = defineStore('rateLimit', () => {
  const search = createPool(5)   // 10–30/min -> low at < 5
  const core = createPool(10)    // 60–5000/hr -> low at < 10

  const update = (headers: Record<string, string>) => {
    const resource = headers['x-ratelimit-resource']
    const target = resource === 'search' ? search : resource === 'core' ? core : null

    if (!target) {
      return
    }

    const l = headers['x-ratelimit-limit']
    const r = headers['x-ratelimit-remaining']
    const t = headers['x-ratelimit-reset']

    const newReset = t ? parseInt(t, 10) : 0

    if (target.resetAt > 0 && newReset > 0 && newReset < target.resetAt) {
      return
    }

    const now = Math.floor(Date.now() / 1000)
    // First update (resetAt === 0): treat as a new window so remaining is always accepted.
    // Subsequent updates: a new window is when the client clock has passed the stored reset point.
    // This correctly handles concurrent requests that carry slightly different reset timestamps —
    // both responses arrive well before resetAt expires, so neither falsely triggers a new window.
    const isNewWindow = target.resetAt === 0
      ? newReset !== 0
      : now >= target.resetAt

    if (l) {
      target.limit = parseInt(l, 10)
    }

    if (r) {
      const newRemaining = parseInt(r, 10)
      // A response whose own reset time is already in the past is from an expired window.
      // Skip writing remaining so it doesn't overwrite state from the current window.
      const isExpiredWindowResponse = isNewWindow && target.resetAt > 0 && newReset > 0 && newReset < now

      if (!isExpiredWindowResponse && (!target.hasData || isNewWindow || newRemaining < target.remaining)) {
        target.remaining = newRemaining
      }
    }

    if (t && newReset > target.resetAt) {
      target.resetAt = newReset
    }
  }

  return {
    search,
    core,
    update,
  }
})
