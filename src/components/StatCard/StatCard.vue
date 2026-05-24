<script setup lang="ts">
defineProps<{
  label: string
  value: string
  icon?: string
}>()
</script>

<template>
  <VCard class="stat-card" variant="tonal" color="primary">
    <VCardItem>
      <VCardSubtitle class="stat-card__label">
        <VIcon v-if="icon" size="12">{{ icon }}</VIcon>
        {{ label }}
      </VCardSubtitle>

      <VCardTitle class="stat-card__value">
        {{ value }}
      </VCardTitle>
    </VCardItem>
  </VCard>
</template>

<style lang="scss">
.stat-card {
  &__label {
    color: var(--color-text-secondary);
    font-size: var(--font-size-caption);
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding-bottom: var(--space-2);
  }

  &__value {
    color: var(--color-text);
    font-size: var(--font-size-body-sm);
    font-weight: var(--font-weight-bold);
  }
}
</style>
