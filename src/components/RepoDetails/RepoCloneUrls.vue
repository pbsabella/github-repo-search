<script setup lang="ts">
import { ref } from 'vue'
import type { CloneField } from '@/composables/useRepoDetails'
import DetailSection from '@/components/DetailSection/DetailSection.vue'

defineProps<{
  fields: CloneField[]
}>()

const copiedKey = ref<'https' | 'ssh' | null>(null)

const copyToClipboard = async (text: string, key: 'https' | 'ssh') => {
  await navigator.clipboard.writeText(text)

  copiedKey.value = key

  setTimeout(() => {
    copiedKey.value = null
  }, 2000)
}
</script>

<template>
  <DetailSection title="Clone">
    <div class="repo-clone-urls">
      <VTextField
        v-for="field in fields"
        :key="field.key"
        :model-value="field.url"
        readonly
        density="compact"
        variant="outlined"
        :label="field.label"
        hide-details
        class="repo-clone-urls__field"
      >
        <template #append-inner>
          <VIcon
            :icon="copiedKey === field.key ? 'mdi-check' : 'mdi-content-copy'"
            :data-testid="copiedKey === field.key ? 'copy-confirmed' : undefined"
            :aria-label="`Copy ${field.key} to clipboard`"
            @click="copyToClipboard(field.url, field.key)"
          />
        </template>
      </VTextField>
    </div>
  </DetailSection>
</template>

<style lang="scss">
.repo-clone-urls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-block: var(--space-2);

  &__field {
    font-family: monospace;
    font-size: var(--font-size-caption);
  }
}
</style>
