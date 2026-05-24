<script setup lang="ts">
import { watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RepoList from '@/components/RepoList/RepoList.vue'
import RepoDetails from '@/components/RepoDetails/RepoDetails.vue'
import { useRepoSearchStore } from '@/stores/repoSearch'
import SidePanel from '@/components/SidePanel/SidePanel.vue'

const store = useRepoSearchStore()
const route = useRoute()
const router = useRouter()

const handleSearch = () => {
  const q = store.query?.trim()

  if (q) {
    store.search(q)
    router.push({ query: { q, page: '1' } })
  }
}

const showPageError = ref(false)

watch(
  () => store.pageError,
  (val) => {
    showPageError.value = !!val
  },
)

const handlePageChange = (page: number) => {
  router.push({ query: { ...route.query, page: String(page) } })
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
</script>

<template>
  <VContainer fluid>
    <h1>Repositories</h1>
  </VContainer>

  <VContainer fluid>
    <VTextField
      v-model="store.query"
      clearable
      label="Search GitHub"
      variant="outlined"
      prepend-inner-icon="mdi-magnify"
      @keyup.enter="handleSearch"
    />

    <!-- TODO: Refine swapping between loading, error, loaded -->
    <VRow v-if="store.loading">
      <VCol v-for="i of 4" :key="i" cols="12">
        <VCard>
          <VSkeletonLoader type="list-item-avatar, sentences" />
        </VCard>
      </VCol>
    </VRow>

    <template v-else>
      <VEmptyState
        v-if="store.error && !store.results.length"
        icon="mdi-alert-circle-outline"
        :text="store.error"
      >
        <template #title>
          <h2 class="search-dashboard__empty-title">Something went wrong</h2>
        </template>
      </VEmptyState>

      <template v-else>
        <VEmptyState
          v-if="!store.hasSearched"
          icon="mdi-magnify"
          text="Enter a repository name, owner, or topic in the search bar above to get started."
        >
          <template #title>
            <h2 class="search-dashboard__empty-title">Ready to explore?</h2>
          </template>
        </VEmptyState>

        <VEmptyState
          v-else-if="!store.results.length"
          icon="mdi-magnify-remove-outline"
          text="Try a different search term."
        >
          <template #title>
            <h2 class="search-dashboard__empty-title">No results found</h2>
          </template>
        </VEmptyState>

        <template v-else>
          <VProgressLinear v-if="store.loading && store.results.length" indeterminate />

          <RepoList
            class="search-dashboard__list"
            :items="store.results"
            @select-repo="(repo) => store.selectRepo(repo)"
          />

          <VRow v-if="store.totalPages > 0" justify="center" density="compact">
            <VCol cols="auto">
              <VPagination
                density="compact"
                :model-value="store.page"
                :total-visible="10"
                :length="store.totalPages"
                :disabled="store.loading"
                @update:model-value="handlePageChange"
              />
            </VCol>
          </VRow>
        </template>
      </template>
    </template>
  </VContainer>

  <VSnackbar
    v-model="showPageError"
    prepend-icon="mdi-alert-circle-outline"
    color="error"
    timeout="3000"
    location="top"
    :text="store.pageError ?? ''"
  />

  <SidePanel
    :model-value="store.selectedRepo !== null"
    @update:model-value="(v) => !v && store.selectRepo(null)"
  >
    <RepoDetails :repo="store.selectedRepo" />
  </SidePanel>
</template>

<style lang="scss">
.search-dashboard {
  &__empty-title {
    font-size: var(--font-size-h4);
  }

  &__list {
    margin-bottom: var(--space-8);
  }

  &__count {
    font-size: var(--font-size-caption);
    text-align: center;
    margin-bottom: 0;
  }
}
</style>
