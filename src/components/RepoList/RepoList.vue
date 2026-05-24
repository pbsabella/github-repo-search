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
  <VList v-if="items.length" class="repo-list">
    <VListItem
      v-for="repo in items"
      class="repo-list__item"
      active-class="repo-list__item--active"
      rounded="0"
      variant="flat"
      :key="repo.id"
      :active="selectedId === repo.id"
      @click="emit('select-repo', repo)"
    >
      <template #default>
        <div class="repo-list__content">
          <VAvatar rounded="sm" size="20">
            <VImg :alt="repo.owner.login" :src="repo.owner.avatar_url" />
          </VAvatar>
          <div>
            <div>
              <p class="repo-list__title">{{ repo.full_name }}</p>
              <p v-if="repo.description" class="repo-list__description">{{ repo.description }}</p>
            </div>

            <div v-if="repo.topics.length" class="repo-list__snapshots">
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

            <div class="repo-list__snapshots">
              <VChip size="x-small" prepend-icon="mdi-code-tags" variant="text">
                {{ repo.language }}
              </VChip>
              <VChip size="x-small" prepend-icon="mdi-star" variant="text">
                {{ formatCompactCount(repo.stargazers_count) }}
              </VChip>
              <VChip size="x-small" prepend-icon="mdi-eye-outline" variant="text">
                {{ formatCompactCount(repo.watchers_count) }}
              </VChip>
              <VChip v-if="repo.archived" size="x-small">Public archive</VChip>
            </div>
          </div>
        </div>
      </template>
    </VListItem>
  </VList>
</template>

<style lang="scss">
.repo-list {
  padding: 0;

  &__item {
    border-bottom: 1px solid var(--color-border);
    border-left: 3px solid transparent;
    padding: var(--space-3);

    &--active {
      border-left-color: rgba(var(--v-theme-primary));
    }
  }

  &__content {
    display: flex;
    gap: var(--space-2);
    align-items: start;
  }

  &__description {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__title {
    font-size: var(--font-size-body-sm);
    line-height: var(--line-height-tight);
    font-weight: var(--font-weight-semibold);
  }

  &__snapshots {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    align-items: center;
    margin-top: var(--space-2);
  }
}
</style>
