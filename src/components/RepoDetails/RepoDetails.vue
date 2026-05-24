<script setup lang="ts">
import { computed } from 'vue'
import StatCard from '@/components/StatCard/StatCard.vue'
import type { GitHubRepo } from '@/types/github'
import { formatCompactCount, formatDate } from '@/utils/format'

// TODO: Fetch data from getRepository
// TODO: Add more details

type RepoDetail = {
  code: string
  label: string
  value: string
  icon?: string
}

const props = defineProps<{
  repo?: GitHubRepo | null
}>()

const repoName = computed<string | undefined>(() => {
  return props.repo?.full_name.split('/')[1]
})

const details = computed<RepoDetail[]>(() => {
  if (!props.repo) {
    return []
  }

  return [
    {
      code: 'stars',
      label: 'Stars',
      value: formatCompactCount(props.repo.stargazers_count),
      icon: 'mdi-star',
    },
    {
      code: 'watchers',
      label: 'Watchers',
      value: formatCompactCount(props.repo.watchers_count),
      icon: 'mdi-eye-outline',
    },
    {
      code: 'open-issues',
      label: 'Open Issues',
      value: formatCompactCount(props.repo.open_issues_count),
      icon: 'mdi-bug-outline',
    },
    {
      code: 'license',
      label: 'License',
      value: props.repo.license?.spdx_id ?? 'N/A',
      icon: 'mdi-scale-balance',
    },
    {
      code: 'created',
      label: 'Created',
      value: formatDate(props.repo.created_at),
      icon: 'mdi-calendar-outline',
    },
    {
      code: 'updated',
      label: 'Updated',
      value: formatDate(props.repo.updated_at),
      icon: 'mdi-calendar-outline',
    },
  ]
})
</script>

<template>
  <div class="repo-details">
    <template v-if="repo">
      <div class="repo-details__content">
        <VContainer class="repo-details__header">
          <VAvatar rounded="sm" size="32">
            <VImg :alt="repo.owner.login" :src="repo.owner.avatar_url" />
          </VAvatar>
          <div>
            <p class="repo-details__name">{{ repoName }}</p>
            <a
              class="repo-details__owner"
              :href="repo.owner.html_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ repo.owner.login }}
            </a>
          </div>
        </VContainer>

        <VDivider />

        <VContainer>
          <VRow>
            <VCol cols="12">
              <VRow density="compact">
                <VCol cols="12">
                  <p class="repo-details__subsection-title">Description</p>
                </VCol>
                <VCol cols="12">
                  <p class="repo-details__description">{{ repo.description }}</p>
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="12">
              <VRow density="compact">
                <!-- TODO: Container query? -->
                <VCol cols="12" md="6" v-for="detail in details" :key="detail.code">
                  <StatCard
                    :key="detail.code"
                    :label="detail.label"
                    :value="detail.value"
                    :icon="detail.icon"
                  />
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="12">
              <VRow v-if="repo.topics.length" density="compact">
                <VCol cols="12">
                  <p class="repo-details__subsection-title">Topics</p>
                </VCol>
                <VCol cols="12" class="repo-details__topics">
                  <VChip v-for="topic of repo.topics" :key="topic" size="x-small">{{ topic }}</VChip>
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </VContainer>
      </div>

      <VContainer class="repo-details__actions">
        <VBtn
          block
          variant="flat"
          color="primary"
          append-icon="mdi-open-in-new"
          target="_blank"
          rel="noopener noreferrer"
          :href="repo.html_url"
        >
          Go to GitHub
        </VBtn>
      </VContainer>
    </template>

    <VContainer v-else>
      <VEmptyState text="Select a repository to view details." />
    </VContainer>
  </div>
</template>

<style lang="scss">
.repo-details {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__content {
    flex: 1;
  }

  &__actions {
    border-top: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  &__header {
    display: flex;
    gap: var(--space-3);
    line-height: var(--line-height-tight);
    align-items: center;
  }

  &__name {
    font-weight: var(--font-weight-bold);
    word-break: break-all;
  }

  &__owner {
    font-size: var(--font-size-caption);
    text-decoration: none;
    color: var(--color-link);

    &:hover {
      color: var(--color-link-hover);
      text-decoration: underline;
      transition: color 0.2s ease-out;
    }
  }

  &__subsection-title {
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-semibold);
  }

  &__description {
    font-size: var(--font-size-body-sm);
  }

  &__topics {
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }
}
</style>
