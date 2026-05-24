<script setup lang="ts">
import { computed } from 'vue'
import { useRateLimitStore } from '@/stores/rateLimit'

const store = useRateLimitStore()

const props = defineProps<{
  compact?: boolean
}>()

const chipColor = computed(() => {
  if (!store.hasData) {
    return
  }

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
  <VAppBar class="the-header" flat border density="compact">
    <VAppBarTitle><h1 class="the-header__title">GitHub Repo Search</h1></VAppBarTitle>
    <template #append>
      <VChip
        :color="chipColor"
        variant="flat"
        prepend-icon="mdi-timer"
        size="small"
        aria-label="API rate limit"
      >
        <div class="the-header__stats">
          <template v-if="store.hasData">
            <span v-if="!props.compact">Rate limit: </span>
            <span>{{ store.remaining }} / {{ store.limit }}</span>
          </template>
          <span v-else>—</span>
        </div>
      </VChip>
    </template>
  </VAppBar>
</template>

<style lang="scss">
.the-header {
  padding-right: var(--space-2);

  &__title {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-body);
  }

  &__stats {
    margin-left: var(--space-1);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }
}
</style>
