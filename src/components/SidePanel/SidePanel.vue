<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <VDialog
    :model-value="modelValue"
    location="end"
    transition="slide-x-reverse-transition"
    scroll-strategy="none"
    max-width="440px"
    height="100dvh"
    viewport-margin="0"
    class="side-panel"
    content-class="side-panel__content"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard height="100%" rounded="0">
      <VBtn
        class="side-panel__close"
        icon="mdi-close"
        variant="text"
        density="compact"
        aria-label="Close panel"
        @click="emit('update:modelValue', false)"
      />
      <slot />
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.side-panel {
  justify-content: end;

  &__content {
    margin: 0;
    margin-left: auto;
    max-height: 100%;
    align-self: stretch;
  }

  &__close {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    z-index: 1;
  }
}
</style>
