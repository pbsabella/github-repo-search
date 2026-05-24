import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { searchRepositories, PER_PAGE } from '@/services/github'
import type { GitHubRepo } from '@/types/github'

// The GitHub REST API provides up to 1,000 results for each search
// see https://docs.github.com/en/rest/search/search
const GITHUB_MAX_RESULTS = 1000

export const useRepoSearchStore = defineStore('repoSearch', () => {
  const query = ref('')
  const results = ref<GitHubRepo[]>([])
  const selectedRepo = ref<GitHubRepo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pageError = ref<string | null>(null)
  const hasSearched = ref(false)
  const page = ref(1)
  const totalCount = ref(0)

  const totalPages = computed(() => Math.ceil(totalCount.value / PER_PAGE))

  const search = async (q: string, pageNum = 1) => {
    if (!q?.trim() || loading.value) {
      return
    }

    query.value = q
    loading.value = true
    error.value = null
    pageError.value = null
    results.value = []
    page.value = pageNum
    hasSearched.value = true
    selectedRepo.value = null

    try {
      const { data } = await searchRepositories(q, pageNum)
      results.value = data.items
      totalCount.value = Math.min(data.total_count, GITHUB_MAX_RESULTS)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Search GitHub failed'
    } finally {
      loading.value = false
    }
  }

  const goToPage = async (newPage: number) => {
    if (loading.value || newPage === page.value) {
      return
    }

    const previousPage = page.value
    loading.value = true
    page.value = newPage
    pageError.value = null
    selectedRepo.value = null

    try {
      const { data } = await searchRepositories(query.value, page.value)
      results.value = data.items
      totalCount.value = Math.min(data.total_count, GITHUB_MAX_RESULTS)
      pageError.value = null
    } catch (e: unknown) {
      page.value = previousPage
      pageError.value = e instanceof Error ? e.message : 'Failed to load page'
    } finally {
      loading.value = false
    }
  }

  const selectRepo = (repo: GitHubRepo | null) => {
    selectedRepo.value = repo
  }

  return {
    error,
    hasSearched,
    loading,
    page,
    pageError,
    query,
    results,
    selectedRepo,
    totalCount,
    totalPages,
    goToPage,
    search,
    selectRepo,
  }
})
