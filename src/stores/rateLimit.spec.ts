import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRateLimitStore } from '@/stores/rateLimit'

describe('useRateLimitStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has correct defaults', () => {
    const store = useRateLimitStore()

    expect(store.limit).toBe(0)
    expect(store.remaining).toBe(0)
    expect(store.resetAt).toBe(0)
    expect(store.hasData).toBe(false)
    expect(store.isLow).toBe(false)
    expect(store.isEmpty).toBe(false)
  })

  it('update() parses all three rate-limit headers', () => {
    const store = useRateLimitStore()
    store.update({
      'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '42',
      'x-ratelimit-reset': '1700000000',
    })

    expect(store.limit).toBe(5000)
    expect(store.remaining).toBe(42)
    expect(store.resetAt).toBe(1700000000)
  })

  it('update() ignores missing headers gracefully', () => {
    const store = useRateLimitStore()
    store.update({})

    expect(store.limit).toBe(0)
    expect(store.remaining).toBe(0)
    expect(store.resetAt).toBe(0)
  })

  it('isLow is true when remaining < 10', () => {
    const store = useRateLimitStore()
    store.update({
      'x-ratelimit-remaining': '5',
      'x-ratelimit-limit': '10',
      'x-ratelimit-reset': '0',
    })

    expect(store.isLow).toBe(true)
  })

  it('isLow is false when remaining > 10', () => {
    const store = useRateLimitStore()
    store.update({
      'x-ratelimit-remaining': '11',
      'x-ratelimit-limit': '10',
      'x-ratelimit-reset': '0',
    })

    expect(store.isLow).toBe(false)
  })

  it('isEmpty is true when remaining is 0', () => {
    const store = useRateLimitStore()
    store.update({
      'x-ratelimit-remaining': '0',
      'x-ratelimit-limit': '10',
      'x-ratelimit-reset': '0',
    })

    expect(store.isEmpty).toBe(true)
  })

  it('update() with only remaining header leaves limit and resetAt unchanged', () => {
    const store = useRateLimitStore()
    store.update({ 'x-ratelimit-remaining': '3' })

    expect(store.remaining).toBe(3)
    expect(store.limit).toBe(0)
    expect(store.resetAt).toBe(0)
  })

  it('update() with only limit header leaves remaining and resetAt unchanged', () => {
    const store = useRateLimitStore()
    store.update({ 'x-ratelimit-limit': '5000' })

    expect(store.limit).toBe(5000)
    expect(store.remaining).toBe(0)
    expect(store.resetAt).toBe(0)
  })
})
