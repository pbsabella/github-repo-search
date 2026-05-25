<script setup lang="ts">
import { watch, computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import RepoList from '@/components/RepoList/RepoList.vue'
import RepoDetails from '@/components/RepoDetails/RepoDetails.vue'
import { useRepoSearchStore } from '@/stores/repoSearch'
import { useRateLimitStore } from '@/stores/rateLimit'
import { formatCompactCount, formatResetTime } from '@/utils/format'

const { mdAndUp } = useDisplay()

const store = useRepoSearchStore()
const rateLimitStore = useRateLimitStore()
const resetTime = computed(() => formatResetTime(rateLimitStore.search.resetAt))
const errorVariant = computed<'rate-limit' | 'network' | null>(() => {
  if (!store.detailsError) {
    return null
  }

  return rateLimitStore.core.isEmpty ? 'rate-limit' : 'network'
})
const route = useRoute()
const router = useRouter()

const listRef = ref<HTMLDivElement | null>(null)

const showPageError = computed({
  get: () => !!store.pageError,
  set: (v) => {
    if (!v) {
      store.pageError = null
    }
  },
})

const pageErrorText = computed(() =>
  rateLimitStore.search.isEmpty ? 'GitHub search rate limit reached.' : (store.pageError ?? ''),
)

const handlePageChange = (page: number) => {
  router.push({ query: { ...route.query, page: String(page) } })
}

const handleSearch = () => {
  const q = store.query?.trim()

  if (q) {
    store.search(q)
    router.push({ query: { q, page: '1' } })
  }
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

const viewState = computed(() => {
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

watch(
  () => store.loading,
  (loading, wasLoading) => {
    if (wasLoading && !loading && store.hasSearched && store.results.length) {
      nextTick(() => listRef.value?.scrollIntoView({ block: 'start' }))
    }
  },
)
</script>

<template>
  <VContainer class="search-dashboard__header" fluid>
    <VRow align="center">
      <VCol cols="7" md="5">
        <VTextField
          v-model="store.query"
          clearable
          hide-details
          color="primary"
          density="compact"
          type="search"
          label="Search GitHub"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="handleSearch"
        />
      </VCol>
      <VCol cols="auto">
        <VBtn
          density="compact"
          height="40"
          variant="flat"
          color="primary"
          aria-label="Search"
          @click="handleSearch"
        >
          Search
        </VBtn>
      </VCol>
      <VCol cols="4">
        <p
          v-if="viewState !== 'initial' && viewState !== 'loading'"
          class="search-dashboard__header-stats"
        >
          <span>{{ formatCompactCount(store.totalCount) }}</span> results
        </p>
      </VCol>
    </VRow>
  </VContainer>

  <VRow no-gutters>
    <VCol class="search-dashboard__repo-list" cols="12" md="4">
      <VContainer v-if="viewState === 'initial'">
        <VEmptyState
          text="Enter a repository name, owner, or topic in the search bar above to get started."
        >
          <template #media>
            <VAvatar rounded="sm" size="48" variant="tonal">
              <VIcon size="24">{{ 'mdi-magnify' }}</VIcon>
            </VAvatar>
          </template>
          <template #title>
            <h2 class="search-dashboard__empty-title">Ready to explore?</h2>
          </template>
        </VEmptyState>
      </VContainer>

      <VContainer v-else-if="viewState === 'error'">
        <VEmptyState>
          <template #media>
            <VAvatar rounded="sm" size="48" variant="tonal" color="error">
              <VIcon size="24" color="error">
                {{
                  rateLimitStore.search.isEmpty
                    ? 'mdi-timer-alert-outline'
                    : 'mdi-alert-circle-outline'
                }}
              </VIcon>
            </VAvatar>
          </template>
          <template #title>
            <h2 class="search-dashboard__empty-title">
              {{ rateLimitStore.search.isEmpty ? 'Rate limit reached' : 'Something went wrong' }}
            </h2>
          </template>
          <template #text>
            <template v-if="rateLimitStore.search.isEmpty">
              <p>
                You've hit GitHub's anonymous rate limit.
                <span v-if="resetTime">
                  Resets at <span class="search-dashboard__empty-time">{{ resetTime }}</span
                  >.
                </span>
              </p>
            </template>
            <template v-else>
              <p>
                The request failed before we got a response. Check your connection and try again.
              </p>
              <p v-if="store.error" class="search-dashboard__empty-subtext">{{ store.error }}</p>
            </template>
          </template>
          <template #actions>
            <VBtn variant="flat" color="primary" size="small" @click="handleSearch">Retry</VBtn>
          </template>
        </VEmptyState>
      </VContainer>

      <VRow v-else-if="viewState === 'loading'">
        <VCol v-for="i of 4" :key="i" cols="12">
          <VSkeletonLoader type="list-item-avatar, sentences" />
        </VCol>
      </VRow>

      <VContainer v-else-if="viewState === 'no-results'">
        <VEmptyState icon="mdi-magnify-remove-outline" text="Try a different search term.">
          <template #media>
            <VAvatar rounded="sm" size="48" variant="tonal">
              <VIcon size="24">{{ 'mdi-magnify-remove-outline' }}</VIcon>
            </VAvatar>
          </template>
          <template #title>
            <h2 class="search-dashboard__empty-title">No results found</h2>
          </template>
        </VEmptyState>
      </VContainer>

      <template v-else>
        <div
          ref="listRef"
          :inert="store.loading || undefined"
          :class="{
            'search-dashboard__list': true,
            'search-dashboard__list--loading': store.loading,
          }"
        >
          <RepoList
            :items="store.results"
            :selected-id="store.selectedRepo?.id ?? null"
            @select-repo="(repo) => store.selectRepo(repo)"
          />
        </div>

        <VRow v-if="store.totalPages > 0" justify="center" density="compact">
          <VCol cols="auto">
            <VContainer>
              <VPagination
                class="search-dashboard__pagination"
                density="compact"
                size="sm"
                :model-value="store.page"
                :total-visible="4"
                :length="store.totalPages"
                :disabled="store.loading"
                @update:model-value="handlePageChange"
              />
            </VContainer>
          </VCol>
        </VRow>
      </template>
    </VCol>

    <VCol v-if="mdAndUp" cols="8">
      <RepoDetails
        :repo="store.selectedRepo"
        :loading="store.detailsLoading"
        :error-variant="errorVariant"
        :languages="store.repoLanguages"
        @retry="store.retryDetails()"
      />
    </VCol>

    <VBottomSheet
      v-else
      :model-value="store.selectedRepo !== null"
      @update:model-value="(v) => !v && store.selectRepo(null)"
    >
      <VSheet min-height="50vh">
        <RepoDetails
          :repo="store.selectedRepo"
          :loading="store.detailsLoading"
          :error-variant="errorVariant"
          :languages="store.repoLanguages"
          @retry="store.retryDetails()"
        />
      </VSheet>
    </VBottomSheet>
  </VRow>

  <VSnackbar
    v-model="showPageError"
    prepend-icon="mdi-alert-circle-outline"
    color="error"
    timeout="5000"
    location="top"
    :text="pageErrorText"
  />
</template>

<style lang="scss">
.search-dashboard {
  &__header {
    border-bottom: 1px solid var(--color-border);
  }

  &__header-stats {
    border-left: 1px solid var(--color-border);
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    padding-left: var(--space-3);

    span {
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
    }
  }

  &__repo-list {
    overflow-y: auto;
    height: calc(100vh - 121px);
    border-right: 1px solid var(--color-border);
  }

  &__empty-title {
    font-size: var(--font-size-h6);
    margin-top: var(--space-4);
  }

  &__empty-time {
    font-weight: var(--font-weight-bold);
  }

  &__empty-subtext {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    margin-top: var(--space-2);
  }

  &__list--loading {
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }

  &__count {
    font-size: var(--font-size-caption);
    text-align: center;
    margin-bottom: 0;
  }

  &__pagination {
    font-size: var(--font-size-body-sm);
  }
}
</style>
