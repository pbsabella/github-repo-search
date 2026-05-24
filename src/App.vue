<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useDisplay } from 'vuetify'
import TheHeader from '@/components/TheHeader/TheHeader.vue'

const { mdAndUp } = useDisplay()
</script>

<template>
  <VApp>
    <TheHeader :compact="!mdAndUp" />

    <VMain>
      <RouterView />
    </VMain>
  </VApp>
</template>
