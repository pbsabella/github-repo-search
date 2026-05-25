<script setup lang="ts">
import type { RepoDetail } from '@/composables/useRepoDetails'
import DetailSection from '@/components/DetailSection/DetailSection.vue'

defineProps<{
  details: RepoDetail[]
}>()
</script>

<template>
  <DetailSection>
    <div class="repo-stats-grid">
      <div v-for="detail in details" :key="detail.code" class="repo-stats-grid__stat">
        <span class="repo-stats-grid__label">
          <VIcon v-if="detail.icon" size="14">{{ detail.icon }}</VIcon>
          {{ detail.label }}
        </span>
        <span class="repo-stats-grid__value">{{ detail.value }}</span>
      </div>
    </div>
  </DetailSection>
</template>

<style lang="scss">
.repo-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);

  @media (min-width: 960px) {
    grid-template-columns: repeat(4, 1fr);
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__label {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__value {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body-sm);
  }
}
</style>
