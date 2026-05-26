import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { searchRepositories, getRepository, getLanguages, PER_PAGE } from '@/services/github'
import { repoName } from '@/utils/format'
import type { GitHubRepo, LanguagesData } from '@/types/github'

type DetailsCacheEntry = {
  repo: GitHubRepo
  languages: LanguagesData | null
}

// The GitHub REST API provides up to 1,000 results for each search
// see https://docs.github.com/en/rest/search/search
const GITHUB_MAX_RESULTS = 1000

export const useRepoSearchStore = defineStore('repoSearch', () => {
  const detailsCache = new Map<string, DetailsCacheEntry>()

  const query = ref('')
  const results = ref<GitHubRepo[]>([])
  const selectedRepo = ref<GitHubRepo | null>(null)
  const repoLanguages = ref<LanguagesData | null>(null)
  const detailsLoading = ref(false)
  const detailsError = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pageError = ref<string | null>(null)
  const hasSearched = ref(false)
  const page = ref(1)
  const totalCount = ref(0)

  const navigableCount = computed(() => Math.min(totalCount.value, GITHUB_MAX_RESULTS))
  const totalPages = computed(() => Math.ceil(navigableCount.value / PER_PAGE))

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
    repoLanguages.value = null
    detailsLoading.value = false
    detailsError.value = false

    try {
      const { data } = await searchRepositories(q, pageNum)

      results.value = data.items
      totalCount.value = data.total_count
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
    repoLanguages.value = null
    detailsLoading.value = false
    detailsError.value = false

    try {
      const { data } = await searchRepositories(query.value, page.value)

      results.value = data.items
      totalCount.value = data.total_count
    } catch (e: unknown) {
      page.value = previousPage
      pageError.value = e instanceof Error ? e.message : 'Failed to load page'
    } finally {
      loading.value = false
    }
  }

  const fetchRepoDetails = async (owner: string, repo: string) => {
    if (!selectedRepo.value) {
      return
    }

    const cacheKey = `${owner}/${repo}`
    const cached = detailsCache.get(cacheKey)

    if (cached) {
      selectedRepo.value = cached.repo
      repoLanguages.value = cached.languages

      return
    }

    detailsLoading.value = true
    detailsError.value = false

    try {
      const [repoResult, langResult] = await Promise.allSettled([
        getRepository(owner, repo),
        getLanguages(owner, repo),
      ])

      // Check if request is stale first
      if (selectedRepo.value?.full_name !== `${owner}/${repo}`) {
        return
      }

      if (repoResult.status === 'fulfilled') {
        selectedRepo.value = repoResult.value.data

        detailsCache.set(cacheKey, {
          repo: repoResult.value.data,
          languages: langResult.status === 'fulfilled' ? langResult.value.data : null,
        })
      } else {
        detailsError.value = true
      }

      if (langResult.status === 'fulfilled') {
        repoLanguages.value = langResult.value.data
      }
    } finally {
      detailsLoading.value = false
    }
  }

  const retryDetails = () => {
    if (!selectedRepo.value) {
      return
    }

    fetchRepoDetails(selectedRepo.value.owner.login, repoName(selectedRepo.value.full_name))
  }

  const selectRepo = (repo: GitHubRepo | null): Promise<void> | void => {
    selectedRepo.value = repo
    repoLanguages.value = null
    detailsError.value = false

    if (repo) {
      return fetchRepoDetails(repo.owner.login, repoName(repo.full_name))
    }
  }

  return {
    detailsError,
    detailsLoading,
    error,
    hasSearched,
    loading,
    navigableCount,
    page,
    pageError,
    query,
    repoLanguages,
    results,
    selectedRepo,
    totalCount,
    totalPages,
    goToPage,
    retryDetails,
    search,
    selectRepo,
  }
})
