<script setup lang="ts">
import { useRateLimitStore } from '@/stores/rateLimit'

const store = useRateLimitStore()

defineProps<{
  compact?: boolean
}>()

const getColor = (pool: { hasData: boolean; isEmpty: boolean; isLow: boolean }) => {
  if (!pool.hasData) {
    return
  }

  if (pool.isEmpty) {
    return 'error'
  }

  if (pool.isLow) {
    return 'warning'
  }

  return 'success'
}
</script>

<template>
  <VAppBar class="the-header" flat border density="compact">
    <VAppBarTitle>
      <h1 class="the-header__title">GitHub Repo Search</h1>
    </VAppBarTitle>

    <template #append>
      <div class="the-header__chips">
        <VChip
          :color="getColor(store.search)"
          variant="flat"
          prepend-icon="mdi-magnify"
          size="x-small"
          aria-label="Search rate limit"
        >
          <template v-if="store.search.hasData">
            <template v-if="compact">
              {{ store.search.remaining }}
            </template>
            <template v-else>
              <span>Search:&nbsp;</span>
              <span>{{ store.search.remaining }} / {{ store.search.limit }}</span>
            </template>
          </template>
          <span v-else>-</span>
        </VChip>

        <VChip
          :color="getColor(store.core)"
          variant="flat"
          prepend-icon="mdi-database-outline"
          size="x-small"
          aria-label="Core rate limit"
        >
          <template v-if="store.core.hasData">
            <template v-if="compact">
              {{ store.core.remaining }}
            </template>
            <template v-else>
              <span>Core:&nbsp;</span>
              <span>{{ store.core.remaining }} / {{ store.core.limit }}</span>
            </template>
          </template>
          <span v-else>-</span>
        </VChip>
      </div>
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

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }
}
</style>
