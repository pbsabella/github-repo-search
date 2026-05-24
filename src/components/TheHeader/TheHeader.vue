<script setup lang="ts">
import { computed } from 'vue'
import { useRateLimitStore } from '@/stores/rateLimit'

const store = useRateLimitStore()

const props = defineProps<{
  compact?: boolean
}>()

const chipColor = computed(() => {
  if (store.isEmpty) {
    return 'error'
  }

  if (store.isLow) {
    return 'warning'
  }

  return 'success'
})
</script>

<template>
  <VAppBar class="the-header" title="GitHub Repo Search">
    <template #append>
      <VChip
        :color="chipColor"
        variant="flat"
        prepend-icon="mdi-timer"
        size="small"
        aria-label="API rate limit"
      >
        <div class="the-header__stats">
          <span v-if="!props.compact">Rate limit: </span>
          <span>{{ store.remaining }} / {{ store.limit }}</span>
        </div>
      </VChip>
    </template>
  </VAppBar>
</template>

<style lang="scss">
.the-header {
  padding-right: var(--space-2);

  &__stats {
    margin-left: var(--space-1);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }
}
</style>
