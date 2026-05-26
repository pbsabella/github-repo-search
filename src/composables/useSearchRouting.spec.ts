import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope, nextTick, reactive } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchRouting } from '@/composables/useSearchRouting'
import { useRepoSearchStore } from '@/stores/repoSearch'
import { useRateLimitStore } from '@/stores/rateLimit'

const mockRoute = reactive({ query: {} as Record<string, string | undefined> })
const mockPush = vi.fn<() => void>()

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush }),
}))

describe('useSearchRouting', () => {
  let scope: ReturnType<typeof effectScope>
  let composable: ReturnType<typeof useSearchRouting>

  beforeEach(() => {
    setActivePinia(createPinia())
    mockRoute.query = {}
    mockPush.mockClear()
    scope = effectScope()
    scope.run(() => {
      composable = useSearchRouting()
    })
  })

  afterEach(() => {
    scope.stop()
    vi.restoreAllMocks()
  })

  describe('viewState', () => {
    it('is initial when hasSearched is false', () => {
      expect(composable.viewState.value).toBe('initial')
    })

    it('is loading when loading with no results', () => {
      const store = useRepoSearchStore()
      store.hasSearched = true
      store.loading = true

      expect(composable.viewState.value).toBe('loading')
    })

    it('is error when error is set and no results', () => {
      const store = useRepoSearchStore()
      store.hasSearched = true
      store.error = 'Network error'

      expect(composable.viewState.value).toBe('error')
    })

    it('is no-results when searched but results are empty', () => {
      const store = useRepoSearchStore()
      store.hasSearched = true

      expect(composable.viewState.value).toBe('no-results')
    })

    it('is results when results are present', () => {
      const store = useRepoSearchStore()
      store.hasSearched = true
      store.results = [{ id: 1 } as never]

      expect(composable.viewState.value).toBe('results')
    })

    it('prefers results over loading when results exist', () => {
      const store = useRepoSearchStore()
      store.hasSearched = true
      store.loading = true
      store.results = [{ id: 1 } as never]

      expect(composable.viewState.value).toBe('results')
    })
  })

  describe('errorVariant', () => {
    it('is null when detailsError is false', () => {
      const store = useRepoSearchStore()
      store.detailsError = false

      expect(composable.errorVariant.value).toBeNull()
    })

    it('is rate-limit when detailsError is true and core pool is empty', () => {
      const store = useRepoSearchStore()
      const rateLimitStore = useRateLimitStore()

      store.detailsError = true
      rateLimitStore.update({
        'x-ratelimit-resource': 'core',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-limit': '60',
        'x-ratelimit-reset': '1700000000',
      })

      expect(composable.errorVariant.value).toBe('rate-limit')
    })

    it('is network when detailsError is true and core pool has remaining quota', () => {
      const store = useRepoSearchStore()
      const rateLimitStore = useRateLimitStore()

      store.detailsError = true
      rateLimitStore.update({
        'x-ratelimit-resource': 'core',
        'x-ratelimit-remaining': '50',
        'x-ratelimit-limit': '60',
        'x-ratelimit-reset': '1700000000',
      })

      expect(composable.errorVariant.value).toBe('network')
    })
  })

  describe('isSearchRateLimited', () => {
    it('is false when search pool has quota', () => {
      const rateLimitStore = useRateLimitStore()
      rateLimitStore.update({
        'x-ratelimit-resource': 'search',
        'x-ratelimit-remaining': '10',
        'x-ratelimit-limit': '30',
        'x-ratelimit-reset': '1700000000',
      })

      expect(composable.isSearchRateLimited.value).toBe(false)
    })

    it('is true when search pool is exhausted', () => {
      const rateLimitStore = useRateLimitStore()
      rateLimitStore.update({
        'x-ratelimit-resource': 'search',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-limit': '30',
        'x-ratelimit-reset': '1700000000',
      })

      expect(composable.isSearchRateLimited.value).toBe(true)
    })
  })

  describe('pageErrorText', () => {
    it('returns store.pageError when search pool has quota', () => {
      const store = useRepoSearchStore()
      const rateLimitStore = useRateLimitStore()

      store.pageError = 'Failed to load page'
      rateLimitStore.update({
        'x-ratelimit-resource': 'search',
        'x-ratelimit-remaining': '5',
        'x-ratelimit-limit': '30',
        'x-ratelimit-reset': '1700000000',
      })

      expect(composable.pageErrorText.value).toBe('Failed to load page')
    })

    it('returns rate-limit message when search pool is exhausted', () => {
      const rateLimitStore = useRateLimitStore()
      rateLimitStore.update({
        'x-ratelimit-resource': 'search',
        'x-ratelimit-remaining': '0',
        'x-ratelimit-limit': '30',
        'x-ratelimit-reset': '1700000000',
      })

      expect(composable.pageErrorText.value).toBe('GitHub search rate limit reached.')
    })
  })

  describe('handleSearch', () => {
    it('calls store.search and pushes to router with trimmed query', async () => {
      const store = useRepoSearchStore()
      vi.spyOn(store, 'search').mockResolvedValue()
      store.query = '  vue  '

      composable.handleSearch()

      expect(store.search).toHaveBeenCalledWith('vue')
      expect(mockPush).toHaveBeenCalledWith({ query: { q: 'vue', page: '1' } })
    })

    it('does nothing when query is blank', () => {
      const store = useRepoSearchStore()
      vi.spyOn(store, 'search').mockResolvedValue()
      store.query = '   '

      composable.handleSearch()

      expect(store.search).not.toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('does nothing when query is empty', () => {
      const store = useRepoSearchStore()
      vi.spyOn(store, 'search').mockResolvedValue()
      store.query = ''

      composable.handleSearch()

      expect(store.search).not.toHaveBeenCalled()
    })
  })

  describe('handlePageChange', () => {
    it('pushes updated page while preserving existing query params', () => {
      mockRoute.query = { q: 'react', page: '1' }

      composable.handlePageChange(3)

      expect(mockPush).toHaveBeenCalledWith({ query: { q: 'react', page: '3' } })
    })
  })

  describe('route watcher', () => {
    it('calls store.search when q changes in the URL', async () => {
      const store = useRepoSearchStore()
      vi.spyOn(store, 'search').mockResolvedValue()
      vi.spyOn(store, 'goToPage').mockResolvedValue()

      mockRoute.query = { q: 'react', page: '1' }
      await nextTick()

      expect(store.search).toHaveBeenCalledWith('react', 1)
      expect(store.goToPage).not.toHaveBeenCalled()
    })

    it('calls store.goToPage when only page changes', async () => {
      const store = useRepoSearchStore()
      vi.spyOn(store, 'search').mockResolvedValue()
      vi.spyOn(store, 'goToPage').mockResolvedValue()

      // Establish initial query state
      mockRoute.query = { q: 'react', page: '1' }
      await nextTick()
      store.query = 'react'
      store.hasSearched = true

      // Now change only the page
      mockRoute.query = { q: 'react', page: '2' }
      await nextTick()

      expect(store.goToPage).toHaveBeenCalledWith(2)
    })

    it('does not trigger search when q is absent', async () => {
      const store = useRepoSearchStore()
      vi.spyOn(store, 'search').mockResolvedValue()

      mockRoute.query = { page: '1' }
      await nextTick()

      expect(store.search).not.toHaveBeenCalled()
    })
  })
})
