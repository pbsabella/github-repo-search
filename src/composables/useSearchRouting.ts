import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRepoSearchStore } from '@/stores/repoSearch'
import { useRateLimitStore } from '@/stores/rateLimit'
import { formatResetTime } from '@/utils/format'

export const useSearchRouting = () => {
  const store = useRepoSearchStore()
  const rateLimitStore = useRateLimitStore()
  const route = useRoute()
  const router = useRouter()

  const listRef = ref<HTMLDivElement | null>(null)

  const resetTime = computed(() => formatResetTime(rateLimitStore.search.resetAt))

  const isSearchRateLimited = computed(() => rateLimitStore.search.isEmpty)

  const errorVariant = computed<'rate-limit' | 'network' | null>(() => {
    if (!store.detailsError) {
      return null
    }

    return rateLimitStore.core.isEmpty ? 'rate-limit' : 'network'
  })

  type ViewState = 'initial' | 'loading' | 'error' | 'no-results' | 'results'

  const viewState = computed<ViewState>(() => {
    if (!store.hasSearched) {
      return 'initial'
    }

    if (store.error && !store.results.length) {
      return 'error'
    }

    if (store.loading && !store.results.length) {
      return 'loading'
    }

    if (!store.results.length) {
      return 'no-results'
    }

    return 'results'
  })

  const showPageError = computed({
    get: () => !!store.pageError,
    set: (v) => {
      if (!v) store.pageError = null
    },
  })

  const pageErrorText = computed(() =>
    rateLimitStore.search.isEmpty ?
      'GitHub search rate limit reached.'
      : (store.pageError ?? ''),
  )

  const handleSearch = () => {
    const q = store.query?.trim()

    if (q) {
      store.search(q)
      router.push({ query: { q, page: '1' } })
    }
  }

  const handlePageChange = (page: number) => {
    router.push({
      query: {
        ...route.query,
        page: String(page),
      }
    })
  }

  watch(
    () => [route.query.q, route.query.page],
    async ([q, pageStr]) => {
      const query = (q as string)?.trim()
      const page = parseInt(pageStr as string, 10) || 1

      if (!query) {
        return
      }

      if (query !== store.query) {
        store.query = query

        await store.search(query, page)
      } else if (page !== store.page && store.hasSearched) {
        await store.goToPage(page)
      }
    },
    { immediate: true },
  )

  watch(
    () => store.loading,
    (loading, wasLoading) => {
      if (wasLoading && !loading && store.hasSearched && store.results.length) {
        nextTick(() => listRef.value?.scrollIntoView({ block: 'start' }))
      }
    },
  )

  return {
    listRef,
    resetTime,
    errorVariant,
    viewState,
    showPageError,
    pageErrorText,
    isSearchRateLimited,
    handleSearch,
    handlePageChange,
  }
}
