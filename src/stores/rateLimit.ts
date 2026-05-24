import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useRateLimitStore = defineStore('rateLimit', () => {
  const limit = ref<number>(0)
  const remaining = ref<number>(0)
  const resetAt = ref<number>(0) // zero means no call made yet

  const update = (headers: Record<string, string>) => {
    const l = headers['x-ratelimit-limit']
    const r = headers['x-ratelimit-remaining']
    const t = headers['x-ratelimit-reset']

    if (l) {
      limit.value = parseInt(l, 10)
    }

    if (r) {
      remaining.value = parseInt(r, 10)
    }

    if (t) {
      resetAt.value = parseInt(t, 10)
    }
  }

  const hasData = computed(() => limit.value > 0)
  const isLow = computed(() => hasData.value && remaining.value < 10)
  const isEmpty = computed(() => hasData.value && remaining.value === 0)

  return {
    hasData,
    isEmpty,
    isLow,
    limit,
    remaining,
    resetAt,
    update,
  }
})
