<script setup lang="ts">
import type { GitHubRepo } from '@/types/github'

defineProps<{
  repo: GitHubRepo
  shortName?: string
}>()
</script>

<template>
  <div class="repo-details-header">
    <div class="repo-details-header__identity">
      <VAvatar rounded="sm" size="40">
        <VImg :alt="repo.owner.login" :src="repo.owner.avatar_url" />
      </VAvatar>
      <div>
        <a
          class="repo-details-header__owner"
          :href="repo.owner.html_url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ repo.owner.login }}
        </a>
        <div class="repo-details-header__name">
          <span>{{ repo.owner.login }}</span>
          <span>/</span>
          <span class="repo-details-header__name-emphasis">{{ shortName }}</span>
        </div>
      </div>
    </div>

    <div class="repo-details-header__actions">
      <VBtn
        variant="flat"
        color="primary"
        prepend-icon="mdi-open-in-new"
        size="small"
        target="_blank"
        rel="noopener noreferrer"
        :href="repo.html_url"
      >
        Open on GitHub
      </VBtn>
      <VBtn
        v-if="repo.homepage"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-web"
        size="small"
        target="_blank"
        rel="noopener noreferrer"
        :href="repo.homepage"
      >
        Visit Homepage
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss">
.repo-details-header {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  line-height: var(--line-height-tight);
  align-items: center;
  padding-top: var(--space-2);
  padding-bottom: var(--space-4);

  &__identity {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1 1 auto;
    min-width: 0;
  }

  &__actions {
    flex: 0 0 auto;
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  &__name {
    color: var(--color-text-secondary);
    word-break: break-all;
    font-size: var(--font-size-h5);
  }

  &__name-emphasis {
    color: var(--color-text);
    font-weight: var(--font-weight-bold);
  }

  &__owner {
    font-size: var(--font-size-caption);
    text-decoration: none;
    color: var(--color-text);

    &:hover {
      color: rgba(var(--v-theme-primary));
      text-decoration: underline;
      transition: color 0.2s ease-out;
    }
  }

  @media (max-width: 599px) {
    .repo-details-header__actions {
      flex-basis: 100%;
    }
  }
}
</style>
