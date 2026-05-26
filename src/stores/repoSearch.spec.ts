import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRepoSearchStore } from '@/stores/repoSearch'
import * as github from '@/services/github'
import type { SearchRepositoriesResponse } from '@/types/github'

const mockHeaders = {
  'x-ratelimit-limit': '60',
  'x-ratelimit-remaining': '59',
  'x-ratelimit-reset': '1700000000',
}

const mockRepo = {
  id: 1,
  full_name: 'facebook/react',
  description: 'A JS library',
  archived: false,
  html_url: 'https://github.com/facebook/react',
  watchers_count: 1000,
  stargazers_count: 2000,
  open_issues_count: 50,
  language: 'JavaScript',
  license: { spdx_id: 'MIT', name: 'MIT License' },
  created_at: '2013-05-24T16:15:54Z',
  updated_at: '2026-01-01T00:00:00Z',
  pushed_at: '2026-01-01T00:00:00Z',
  forks_count: 500,
  homepage: null,
  clone_url: 'https://github.com/facebook/react.git',
  ssh_url: 'git@github.com:facebook/react.git',
  is_template: false,
  has_pages: false,
  has_discussions: false,
  has_wiki: false,
  topics: ['react'],
  owner: {
    login: 'facebook',
    avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    html_url: 'https://github.com/facebook',
  },
}

const makeSearchResult = (overrides: Partial<SearchRepositoriesResponse> = {}) => ({
  data: {
    total_count: 1,
    incomplete_results: false,
    items: [mockRepo],
    ...overrides,
  },
  headers: mockHeaders,
})

describe('useRepoSearchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  describe('search()', () => {
    it('sets results and totalCount on success', async () => {
      vi.spyOn(github, 'searchRepositories').mockResolvedValue(makeSearchResult())

      const store = useRepoSearchStore()
      await store.search('react')

      expect(store.results).toEqual([mockRepo])
      expect(store.totalCount).toBe(1)
      expect(store.hasSearched).toBe(true)
      expect(store.error).toBeNull()
      expect(store.loading).toBe(false)
    })

    it('resets page to 1 and clears previous results on new search', async () => {
      vi.spyOn(github, 'searchRepositories').mockResolvedValue(makeSearchResult())

      const store = useRepoSearchStore()
      store.page = 3
      await store.search('react')

      expect(store.page).toBe(1)
    })

    it('stores the raw totalCount and caps navigableCount at 1000', async () => {
      vi.spyOn(github, 'searchRepositories').mockResolvedValue(
        makeSearchResult({ total_count: 9999, items: [mockRepo] }),
      )

      const store = useRepoSearchStore()
      await store.search('react')

      expect(store.totalCount).toBe(9999)
      expect(store.navigableCount).toBe(1000)
    })

    it('sets error and clears results on failure', async () => {
      vi.spyOn(github, 'searchRepositories').mockRejectedValue(new Error('Network error'))

      const store = useRepoSearchStore()
      await store.search('react')

      expect(store.error).toBe('Network error')
      expect(store.results).toEqual([])
      expect(store.loading).toBe(false)
    })

    it('sets generic error message when thrown value is not an Error', async () => {
      vi.spyOn(github, 'searchRepositories').mockRejectedValue('oops')

      const store = useRepoSearchStore()
      await store.search('react')

      expect(store.error).toBe('Search GitHub failed')
    })

    it('does nothing when query is blank', async () => {
      const spy = vi.spyOn(github, 'searchRepositories')

      const store = useRepoSearchStore()
      await store.search('   ')

      expect(spy).not.toHaveBeenCalled()
    })

    it('does nothing when already loading', async () => {
      const store = useRepoSearchStore()
      store.loading = true
      const spy = vi.spyOn(github, 'searchRepositories')

      await store.search('react')

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('goToPage()', () => {
    it('loads a new page and updates results', async () => {
      const page2Repo = { ...mockRepo, id: 2, full_name: 'vuejs/core' }
      vi.spyOn(github, 'searchRepositories')
        .mockResolvedValueOnce(makeSearchResult())
        .mockResolvedValueOnce({ data: { total_count: 1, incomplete_results: false, items: [page2Repo] }, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.search('react')
      await store.goToPage(2)

      expect(store.page).toBe(2)
      expect(store.results[0]?.full_name).toBe('vuejs/core')
    })

    it('reverts page on failure', async () => {
      vi.spyOn(github, 'searchRepositories')
        .mockResolvedValueOnce(makeSearchResult())
        .mockRejectedValueOnce(new Error('Failed'))

      const store = useRepoSearchStore()
      await store.search('react')
      await store.goToPage(2)

      expect(store.page).toBe(1)
      expect(store.pageError).toBe('Failed')
    })

    it('does nothing when called with the current page', async () => {
      const spy = vi.spyOn(github, 'searchRepositories').mockResolvedValue(makeSearchResult())

      const store = useRepoSearchStore()
      await store.search('react')
      spy.mockClear()
      await store.goToPage(1)

      expect(spy).not.toHaveBeenCalled()
    })

  })

  describe('totalPages', () => {
    it('caps totalPages at GITHUB_MAX_RESULTS / PER_PAGE', async () => {
      vi.spyOn(github, 'searchRepositories').mockResolvedValue(
        makeSearchResult({ total_count: 9999 }),
      )
      const store = useRepoSearchStore()
      await store.search('react')

      expect(store.totalPages).toBe(Math.ceil(1000 / github.PER_PAGE)) // 100 pages, not 1000
    })
  })

  describe('selectRepo()', () => {
    it('sets selectedRepo', () => {
      const store = useRepoSearchStore()
      store.selectRepo(mockRepo)
      expect(store.selectedRepo).toEqual(mockRepo)
    })

    it('clears selectedRepo when called with null', () => {
      const store = useRepoSearchStore()
      store.selectRepo(mockRepo)
      store.selectRepo(null)
      expect(store.selectedRepo).toBeNull()
    })
  })

  describe('selectRepo() - detail fetching', () => {
    const enrichedRepo = {
      ...mockRepo,
      clone_url: 'https://github.com/facebook/react.git',
      ssh_url: 'git@github.com:facebook/react.git',
      forks_count: 42,
    }
    const mockLanguages = { JavaScript: 5000, TypeScript: 2000 }

    it('updates selectedRepo and repoLanguages on success', async () => {
      vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.selectedRepo).toEqual(enrichedRepo)
      expect(store.repoLanguages).toEqual(mockLanguages)
      expect(store.detailsLoading).toBe(false)
    })

    it('sets detailsLoading true while fetching then clears it', async () => {
      let resolveRepo!: (v: { data: typeof enrichedRepo; headers: typeof mockHeaders }) => void
      vi.spyOn(github, 'getRepository').mockReturnValue(new Promise(r => { resolveRepo = r }))
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      const fetchPromise = store.selectRepo(mockRepo)

      expect(store.detailsLoading).toBe(true)
      resolveRepo({ data: enrichedRepo, headers: mockHeaders })
      await fetchPromise

      expect(store.detailsLoading).toBe(false)
    })

    it('does nothing when repo is null', async () => {
      const spy = vi.spyOn(github, 'getRepository')
      const store = useRepoSearchStore()
      await store.selectRepo(null)

      expect(spy).not.toHaveBeenCalled()
    })

    it('ignores response if selection changed mid-flight', async () => {
      const otherRepo = { ...mockRepo, id: 2, full_name: 'vuejs/core' }
      let resolveFirst!: (v: { data: typeof enrichedRepo; headers: typeof mockHeaders }) => void
      vi.spyOn(github, 'getRepository')
        .mockReturnValueOnce(new Promise(r => { resolveFirst = r }))
        .mockResolvedValueOnce({ data: otherRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      const firstFetch = store.selectRepo(mockRepo)

      store.selectedRepo = otherRepo

      resolveFirst({ data: enrichedRepo, headers: mockHeaders })
      await firstFetch

      expect(store.selectedRepo?.full_name).toBe('vuejs/core')
    })

    it('keeps selectedRepo from search when getRepository fails', async () => {
      vi.spyOn(github, 'getRepository').mockRejectedValue(new Error('API error'))
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.selectedRepo).toEqual(mockRepo)
      expect(store.repoLanguages).toBeNull()
      expect(store.detailsLoading).toBe(false)
    })

    it('leaves repoLanguages null when getLanguages fails', async () => {
      vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages').mockRejectedValue(new Error('API error'))

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.repoLanguages).toBeNull()
      expect(store.selectedRepo).toEqual(enrichedRepo)
    })

    it('detailsError is false after a successful fetch', async () => {
      vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.detailsError).toBe(false)
    })

    it('detailsError is true when getRepository fails', async () => {
      vi.spyOn(github, 'getRepository').mockRejectedValue(new Error('Network error'))
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.detailsError).toBe(true)
    })

    it('serves from cache on second selectRepo call to the same repo', async () => {
      const getRepoSpy = vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      getRepoSpy.mockClear()
      await store.selectRepo(mockRepo)

      expect(getRepoSpy).not.toHaveBeenCalled()
    })

    it('getLanguages failure alone does not set detailsError', async () => {
      vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages').mockRejectedValue(new Error('API error'))

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.detailsError).toBe(false)
    })

    it('detailsError is cleared when selectRepo is called with null', async () => {
      vi.spyOn(github, 'getRepository').mockRejectedValue(new Error('err'))
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)
      expect(store.detailsError).toBe(true)

      store.selectRepo(null)
      expect(store.detailsError).toBe(false)
    })

    it('detailsError is cleared when search() is called', async () => {
      vi.spyOn(github, 'getRepository').mockRejectedValue(new Error('err'))
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })
      vi.spyOn(github, 'searchRepositories').mockResolvedValue(makeSearchResult())

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)
      expect(store.detailsError).toBe(true)

      await store.search('vue')
      expect(store.detailsError).toBe(false)
    })

    it('sets langError when getLanguages fails and getRepository succeeds', async () => {
      vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages').mockRejectedValue(new Error('API error'))

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.langError).toBe(true)
      expect(store.detailsError).toBe(false)
      expect(store.repoLanguages).toBeNull()
      expect(store.selectedRepo).toEqual(enrichedRepo)
    })

    it('does not set langError when getRepository fails', async () => {
      vi.spyOn(github, 'getRepository').mockRejectedValue(new Error('API error'))
      vi.spyOn(github, 'getLanguages').mockResolvedValue({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.langError).toBe(false)
      expect(store.detailsError).toBe(true)
      expect(store.repoLanguages).toBeNull()
    })

    it('does not set langError when both requests fail', async () => {
      vi.spyOn(github, 'getRepository').mockRejectedValue(new Error('API error'))
      vi.spyOn(github, 'getLanguages').mockRejectedValue(new Error('API error'))

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)

      expect(store.langError).toBe(false)
      expect(store.detailsError).toBe(true)
    })

    it('does not cache when getLanguages fails so retry re-fetches', async () => {
      const getRepoSpy = vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages')
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)
      expect(store.langError).toBe(true)

      getRepoSpy.mockClear()
      await store.selectRepo(mockRepo)

      expect(getRepoSpy).toHaveBeenCalled()
      expect(store.langError).toBe(false)
      expect(store.repoLanguages).toEqual(mockLanguages)
    })

    it('langError is cleared when selectRepo is called with null', async () => {
      vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages').mockRejectedValue(new Error('API error'))

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)
      expect(store.langError).toBe(true)

      store.selectRepo(null)
      expect(store.langError).toBe(false)
    })

    it('langError is cleared when selecting a different repo', async () => {
      const otherRepo = { ...mockRepo, id: 2, full_name: 'vuejs/core' }
      vi.spyOn(github, 'getRepository').mockResolvedValue({ data: enrichedRepo, headers: mockHeaders })
      vi.spyOn(github, 'getLanguages')
        .mockRejectedValueOnce(new Error('API error'))
        .mockResolvedValueOnce({ data: mockLanguages, headers: mockHeaders })

      const store = useRepoSearchStore()
      await store.selectRepo(mockRepo)
      expect(store.langError).toBe(true)

      await store.selectRepo(otherRepo)
      expect(store.langError).toBe(false)
    })
  })
})
