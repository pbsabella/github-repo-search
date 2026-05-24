<script setup lang="ts">
import type { GitHubRepo } from '@/types/github'
import { formatCompactCount } from '@/utils/format'

defineProps<{
  items: GitHubRepo[]
  selectedId: number | null
}>()

const emit = defineEmits<{
  'select-repo': [value: GitHubRepo]
}>()
</script>

<template>
  <VRow v-if="items.length">
    <VCol cols="12" v-for="repo in items" :key="repo.id">
      <VCard @click="emit('select-repo', repo)">
        <VCardItem>
          <template #prepend>
            <VAvatar rounded="sm" size="24">
              <VImg :alt="repo.owner.login" :src="repo.owner.avatar_url" />
            </VAvatar>
          </template>

          <VCardTitle class="repo-list__card-title">{{ repo.full_name }}</VCardTitle>
          <VCardSubtitle class="repo-list__card-subtitle">by {{ repo.owner.login }}</VCardSubtitle>

          <template v-if="repo.archived" #append>
            <VChip color="outlined" size="small" variant="outlined">Public archive</VChip>
          </template>
        </VCardItem>

        <VCardText>
          <p class="repo-list__card-description">{{ repo.description }}</p>

          <div class="repo-list__card-snapshots">
            <VChip
              v-for="topic in repo.topics.slice(0, 5)"
              :key="topic"
              size="x-small"
              variant="tonal"
              color="primary"
            >
              {{ topic }}
            </VChip>
          </div>

          <div class="repo-list__card-snapshots">
            <VChip size="x-small" prepend-icon="mdi-code-tags" variant="text">
              {{ repo.language }}
            </VChip>
            <VChip size="x-small" prepend-icon="mdi-star" variant="text">
              {{ formatCompactCount(repo.stargazers_count) }}
            </VChip>
            <VChip size="x-small" prepend-icon="mdi-eye-outline" variant="text">
              {{ formatCompactCount(repo.watchers_count) }}
            </VChip>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.repo-list {
  &__card-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__card-title {
    font-size: var(--font-size-body-sm);
    line-height: var(--line-height-tight);
    font-weight: var(--font-weight-semibold);
  }

  &__card-subtitle {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
  }

  &__card-snapshots {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    align-items: center;
    margin-top: var(--space-2);
  }
}
</style>
