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
  topics: ['react'],
  owner: {
    login: 'facebook',
    avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    html_url: 'https://github.com/facebook',
  },
}

const makeSearchResult = (overrides: Partial<SearchRepositoriesResponse> = {}) => ({
  data: { total_count: 1, items: [mockRepo], ...overrides },
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
      store.page = 3 as unknown as typeof store.page
      await store.search('react')

      expect(store.page).toBe(1)
    })

    it('caps totalCount at 1000', async () => {
      vi.spyOn(github, 'searchRepositories').mockResolvedValue(
        makeSearchResult({ total_count: 9999, items: [mockRepo] }),
      )

      const store = useRepoSearchStore()
      await store.search('react')

      expect(store.totalCount).toBe(1000)
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
        .mockResolvedValueOnce({ data: { total_count: 1, items: [page2Repo] }, headers: mockHeaders })

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
    it('computes total pages from totalCount and PER_PAGE', async () => {
      vi.spyOn(github, 'searchRepositories').mockResolvedValue(
        makeSearchResult({ total_count: 25, items: [mockRepo] }),
      )

      const store = useRepoSearchStore()
      await store.search('react')

      expect(store.totalPages).toBe(Math.ceil(25 / github.PER_PAGE))
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
})
