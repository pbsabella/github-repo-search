<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import RepoList from '@/components/RepoList/RepoList.vue'
import RepoDetails from '@/components/RepoDetails/RepoDetails.vue'
import { useRepoSearchStore } from '@/stores/repoSearch'
import type { GitHubRepo } from '@/types/github'
import SidePanel from '@/components/SidePanel/SidePanel.vue'

const store = useRepoSearchStore()

const handleSearch = () => {
  if (store.query?.trim()) {
    store.search(store.query)
  }
}

// TODO: Fix error handling between search & pager

const showPageError = ref(false)

watch(
  () => store.pageError,
  (val) => {
    if (val) {
      showPageError.value = true
    } else {
      showPageError.value = false
    }
  },
)

const isPanelOpen = computed({
  get: () => store.selectedRepo !== null,
  set: (open) => {
    if (!open) store.selectRepo(null)
  },
})

const handleSelectRepo = (repo: GitHubRepo) => {
  store.selectRepo(repo)
}
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
            :selected-id="store.selectedRepo?.id ?? null"
            @select-repo="(repo) => handleSelectRepo(repo)"
          />

          <VRow v-if="store.totalPages > 0" justify="center" density="compact">
            <VCol cols="12">
              <p class="search-dashboard__count">
                Page {{ store.page }} of {{ store.totalPages }} ({{
                  store.totalCount.toLocaleString()
                }}
                results)
              </p>
            </VCol>
            <VCol cols="auto">
              <VPagination
                density="compact"
                :model-value="store.page"
                :total-visible="10"
                :length="store.totalPages"
                :disabled="store.loading"
                @update:model-value="store.goToPage"
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

  <SidePanel v-model="isPanelOpen">
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
