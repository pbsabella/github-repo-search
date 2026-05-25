<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="detail-section">
    <p v-if="title" class="detail-section__title">{{ title }}</p>

    <slot />
  </div>
</template>

<style lang="scss">
.detail-section {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background);
  padding: var(--space-3);

  &__title {
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-2);
  }
}
</style>
