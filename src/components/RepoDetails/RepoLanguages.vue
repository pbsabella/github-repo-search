<script setup lang="ts">
import DetailSection from '@/components/DetailSection/DetailSection.vue'
import { langColor } from '@/utils/color'

defineProps<{
  items: {
    name: string
    pct: string
  }[]
}>()
</script>

<template>
  <DetailSection title="Languages">
    <div class="repo-languages">
      <span v-for="lang in items" :key="lang.name" class="repo-languages__item">
        <span class="repo-languages__dot" :style="{ backgroundColor: langColor(lang.name) }" />
        <span>{{ lang.name }}</span>
        <span class="repo-languages__sep">&middot;</span>
        <span class="repo-languages__pct">{{ lang.pct }}%</span>
      </span>
    </div>
  </DetailSection>
</template>

<style lang="scss">
.repo-languages {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--font-size-body-sm);
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
  }

  &__sep {
    color: var(--color-text-secondary);
  }

  &__pct {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }
}
</style>
