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
    const isNewWindow = newReset !== 0 && newReset !== target.resetAt

    if (l) {
      target.limit = parseInt(l, 10)
    }

    if (r) {
      const newRemaining = parseInt(r, 10)

      // Handle two core API calls (getRepository and getLanguages) where response can be out of order
      // Same window: higher remaining values never overwrite lower ones
      // New window (reset changed): remaining correctly resets to higher values
      if (!target.hasData || isNewWindow || newRemaining < target.remaining) {
        target.remaining = newRemaining
      }
    }

    if (t) {
      target.resetAt = parseInt(t, 10)
    }
  }

  return {
    search,
    core,
    update,
  }
})
