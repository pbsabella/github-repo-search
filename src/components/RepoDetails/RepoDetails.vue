<script setup lang="ts">
import { toRef } from 'vue'
import type { GitHubRepo, LanguagesData } from '@/types/github'
import { useRepoDetails } from '@/composables/useRepoDetails'
import DetailSection from '@/components/DetailSection/DetailSection.vue'
import RepoDetailsHeader from './RepoDetailsHeader.vue'
import RepoStatsGrid from './RepoStatsGrid.vue'
import RepoLanguages from './RepoLanguages.vue'
import RepoCloneUrls from './RepoCloneUrls.vue'

const props = defineProps<{
  repo?: GitHubRepo | null
  loading?: boolean
  languages?: LanguagesData | null
  errorVariant?: 'rate-limit' | 'network' | null
  langError?: boolean
  resetTime?: string
}>()

const emit = defineEmits<{
  retry: []
}>()

const { repoShortName, cloneFields, languageItems, featureBadges, details } = useRepoDetails(
  toRef(props, 'repo'),
  toRef(props, 'languages'),
)
</script>

<template>
  <VContainer class="repo-details">
    <template v-if="repo">
      <div class="repo-details__progress">
        <VProgressLinear
          v-if="loading"
          aria-label="Loading repository details"
          indeterminate
          color="primary"
          height="2"
        />
      </div>

      <div v-if="errorVariant" class="repo-details__error">
        <VAlert variant="tonal" density="compact" type="error">
          <template #append>
            <VBtn size="small" variant="text" @click="emit('retry')">Retry</VBtn>
          </template>
          <template #text>
            <p class="repo-details__error-text">
              {{
                errorVariant === 'rate-limit'
                  ? 'Core rate limit reached. Details may be incomplete.'
                  : 'Something went wrong. Details may be incomplete.'
              }}
              <template v-if="errorVariant === 'rate-limit' && resetTime">
                Resets at <strong>{{ resetTime }}</strong
                >.
              </template>
            </p>
          </template>
        </VAlert>
      </div>

      <div class="repo-details__content">
        <RepoDetailsHeader :repo="repo" :short-name="repoShortName" />

        <VRow>
          <VCol cols="12">
            <p v-if="repo.description" class="repo-details__description">
              {{ repo.description }}
            </p>
          </VCol>

          <VCol v-if="repo.topics.length" cols="12">
            <div class="repo-details__chip-list">
              <VChip
                v-for="topic of repo.topics"
                :key="topic"
                size="small"
                variant="tonal"
                color="primary"
              >
                {{ topic }}
              </VChip>
            </div>
          </VCol>

          <VCol v-if="featureBadges.length" cols="12">
            <div class="repo-details__chip-list">
              <VChip
                v-for="badge in featureBadges"
                :key="badge.label"
                :color="badge.color"
                :prepend-icon="badge.icon"
                size="small"
                variant="tonal"
              >
                {{ badge.label }}
              </VChip>
            </div>
          </VCol>

          <VCol cols="12">
            <RepoStatsGrid :details="details" />
          </VCol>

          <VCol
            v-if="languageItems.length || (langError && errorVariant !== 'rate-limit')"
            cols="12"
          >
            <RepoLanguages v-if="languageItems.length" :items="languageItems" />
            <DetailSection v-else title="Languages">
              <VAlert variant="outlined" density="compact" type="error" icon-size="small">
                <template #append>
                  <VBtn size="small" variant="text" @click="emit('retry')">Retry</VBtn>
                </template>
                <template #text>
                  <p class="repo-details__error-text">Language data unavailable.</p>
                </template>
              </VAlert>
            </DetailSection>
          </VCol>

          <VCol v-if="cloneFields.length" cols="12">
            <RepoCloneUrls :fields="cloneFields" />
          </VCol>
        </VRow>
      </div>
    </template>

    <template v-else>
      <VEmptyState
        text-width="360"
        text="Once results appear on the left, select a repository to view details."
      >
        <template #media>
          <VAvatar rounded="sm" size="48" variant="text">
            <VIcon size="44">{{ 'mdi-package-variant' }}</VIcon>
          </VAvatar>
        </template>
        <template #title>
          <h2 class="repo-details__empty-title">Nothing to show</h2>
        </template>
      </VEmptyState>
    </template>
  </VContainer>
</template>

<style lang="scss">
.repo-details {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__progress {
    height: 2px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
  }

  &__description {
    font-size: var(--font-size-body-sm);
  }

  &__chip-list {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  &__error {
    margin-bottom: var(--space-3);
  }

  &__error-text {
    font-size: var(--font-size-body-sm);
  }

  &__empty-title {
    font-size: var(--font-size-h6);
    margin-top: var(--space-4);
  }
}
</style>
