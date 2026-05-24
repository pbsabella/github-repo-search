<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRateLimitStore } from '@/stores/rateLimit'
import TheHeader from '@/components/TheHeader/TheHeader.vue'
import { formatResetTime } from '@/utils/format'

const { mdAndUp } = useDisplay()
const store = useRateLimitStore()

const showBanner = computed(() => store.isEmpty)
const resetTime = computed(() => formatResetTime(store.resetAt))
</script>

<template>
  <VApp>
    <TheHeader :compact="!mdAndUp" />

    <VMain scrollable>
      <VBanner
        v-if="showBanner"
        role="alert"
        aria-live="assertive"
        aria-label="System error"
        color="error"
        icon="mdi-alert-circle"
      >
        <VBannerText>
          GitHub API rate limit reached.
          <span v-if="resetTime">Resets at {{ resetTime }}.</span>
        </VBannerText>
      </VBanner>

      <RouterView />
    </VMain>
  </VApp>
</template>
