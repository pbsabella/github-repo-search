import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockUpdate = vi.fn<() => void>()

vi.mock('@/stores/rateLimit', () => ({
  useRateLimitStore: () => ({ update: mockUpdate }),
}))

const captured = vi.hoisted(() => ({
  fulfillHandler: null as ((res: unknown) => unknown) | null,
  rejectHandler: null as ((err: unknown) => Promise<never>) | null,
}))

vi.mock('axios', () => {
  const isAxiosError = vi.fn<(err: unknown) => boolean>(
    (err) => !!(err as Record<string, unknown>)?.__isAxiosError,
  )

  const mockApi = {
    interceptors: {
      response: {
        use: vi.fn<(
          onFulfilled: (res: unknown) => unknown,
          onRejected: (err: unknown) => Promise<never>,
        ) => number
        >((onFulfilled, onRejected) => {
          captured.fulfillHandler = onFulfilled
          captured.rejectHandler = onRejected
          return 0
        }),
        eject: vi.fn<(id: number) => void>(),
      },
    },
    get: vi.fn<() => Promise<unknown>>(),
  }

  return {
    default: {
      create: vi.fn<() => typeof mockApi>(() => mockApi),
      isAxiosError,
    },
  }
})

// Importing triggers the module-level interceptor registration
import '@/services/github'

describe('github service interceptors', () => {
  beforeEach(() => {
    mockUpdate.mockClear()
    setActivePinia(createPinia())
  })

  it('calls rateLimit.update on a successful response with rate-limit headers', () => {
    const headers = {
      'x-ratelimit-resource': 'core',
      'x-ratelimit-remaining': '59',
      'x-ratelimit-limit': '60',
      'x-ratelimit-reset': '1748000000',
    }

    captured.fulfillHandler!({ headers })

    expect(mockUpdate).toHaveBeenCalledOnce()
    expect(mockUpdate).toHaveBeenCalledWith(headers)
  })

  it('does not call rateLimit.update when rate-limit headers are absent', () => {
    captured.fulfillHandler!({ headers: { 'content-type': 'application/json' } })

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls rateLimit.update via the error interceptor on a 403 with rate-limit headers', async () => {
    const headers = {
      'x-ratelimit-resource': 'core',
      'x-ratelimit-remaining': '0',
      'x-ratelimit-limit': '60',
      'x-ratelimit-reset': '1748000000',
    }
    const fakeError = { __isAxiosError: true, response: { headers } }

    await expect(captured.rejectHandler!(fakeError)).rejects.toEqual(fakeError)

    expect(mockUpdate).toHaveBeenCalledOnce()
    expect(mockUpdate).toHaveBeenCalledWith(headers)
  })

  it('does not call rateLimit.update on an error without rate-limit headers', async () => {
    const fakeError = {
      __isAxiosError: true,
      response: { headers: { 'content-type': 'application/json' } },
    }

    await expect(captured.rejectHandler!(fakeError)).rejects.toEqual(fakeError)

    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('does not throw when error response has no headers', async () => {
    const fakeError = { __isAxiosError: true, response: null }

    await expect(captured.rejectHandler!(fakeError)).rejects.toEqual(fakeError)

    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
