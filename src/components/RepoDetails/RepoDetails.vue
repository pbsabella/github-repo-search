<script setup lang="ts">
import { computed, ref } from 'vue'
import DetailSection from '@/components/DetailSection/DetailSection.vue'
import type { GitHubRepo, LanguagesData } from '@/types/github'
import { formatCompactCount, formatDate } from '@/utils/format'
import { langColor } from '@/utils/color'

type RepoDetail = {
  code: string
  label: string
  value: string
  icon?: string
}

type Badge = {
  label: string
  color?: string
  icon: string
}

type CloneField = {
  label: string
  key: 'https' | 'ssh'
  url: string
}

const props = defineProps<{
  repo?: GitHubRepo | null
  loading?: boolean
  languages?: LanguagesData | null
  errorVariant?: 'rate-limit' | 'network' | null
}>()

const emit = defineEmits<{
  retry: []
}>()

const copiedKey = ref<'https' | 'ssh' | null>(null)

const repoShortName = computed(() => props.repo?.full_name.split('/')[1])

const cloneFields = computed<CloneField[]>(() => {
  if (!props.repo) {
    return []
  }

  const fields: CloneField[] = []

  if (props.repo.clone_url) {
    fields.push({ label: 'HTTPS', key: 'https', url: props.repo.clone_url })
  }

  if (props.repo.ssh_url) {
    fields.push({ label: 'SSH', key: 'ssh', url: props.repo.ssh_url })
  }

  return fields
})

const languageItems = computed(() => {
  const data = props.languages

  if (!data) {
    return []
  }

  const total = Object.values(data).reduce((sum: number, n: number) => sum + n, 0)

  if (total === 0) {
    return []
  }

  return Object.keys(data)
    .sort((a, b) => (data[b] ?? 0) - (data[a] ?? 0))
    .map((name) => ({
      name,
      pct: (((data[name] ?? 0) / total) * 100).toFixed(1),
    }))
    .filter(({ pct }) => parseFloat(pct) > 0)
})

const featureBadges = computed<Badge[]>(() => {
  if (!props.repo) {
    return []
  }

  const badges: Badge[] = []

  if (props.repo.archived) {
    badges.push({ label: 'Archived', color: 'warning', icon: 'mdi-archive-outline' })
  }

  if (props.repo.is_template) {
    badges.push({ label: 'Template', icon: 'mdi-content-copy' })
  }

  if (props.repo.has_pages) {
    badges.push({ label: 'Pages', icon: 'mdi-web' })
  }

  if (props.repo.has_discussions) {
    badges.push({ label: 'Discussions', icon: 'mdi-forum-outline' })
  }

  if (props.repo.has_wiki) {
    badges.push({ label: 'Wiki', icon: 'mdi-book-open-outline' })
  }

  return badges
})

const details = computed<RepoDetail[]>(() => {
  if (!props.repo) {
    return []
  }

  return [
    {
      code: 'stars',
      label: 'Stars',
      value: formatCompactCount(props.repo.stargazers_count),
      icon: 'mdi-star',
    },
    {
      code: 'watchers',
      label: 'Watchers',
      value: formatCompactCount(props.repo.watchers_count),
      icon: 'mdi-eye-outline',
    },
    {
      code: 'open-issues',
      label: 'Open Issues',
      value: formatCompactCount(props.repo.open_issues_count),
      icon: 'mdi-bug-outline',
    },
    {
      code: 'license',
      label: 'License',
      value: props.repo.license?.spdx_id ?? 'N/A',
      icon: 'mdi-scale-balance',
    },
    {
      code: 'forks',
      label: 'Forks',
      value: props.repo.forks_count != null ? formatCompactCount(props.repo.forks_count) : '-',
      icon: 'mdi-source-fork',
    },
    {
      code: 'created',
      label: 'Created',
      value: formatDate(props.repo.created_at),
      icon: 'mdi-calendar-plus',
    },
    {
      code: 'updated',
      label: 'Updated',
      value: formatDate(props.repo.updated_at),
      icon: 'mdi-calendar-edit',
    },
    {
      code: 'pushed',
      label: 'Last Pushed',
      value: props.repo.pushed_at ? formatDate(props.repo.pushed_at) : '-',
      icon: 'mdi-source-commit',
    },
  ]
})

const copyToClipboard = async (text: string, key: 'https' | 'ssh') => {
  await navigator.clipboard.writeText(text)

  copiedKey.value = key

  setTimeout(() => {
    copiedKey.value = null
  }, 2000)
}
</script>

<template>
  <VContainer class="repo-details">
    <template v-if="repo">
      <div class="repo-details__progress">
        <VProgressLinear
          v-if="loading"
          aria-label="Loading repository details"
          indeterminate
          color="primary"
          height="2"
        />
      </div>

      <div v-if="errorVariant" class="repo-details__error">
        <VAlert
          variant="tonal"
          :type="errorVariant === 'rate-limit' ? 'warning' : 'error'"
          density="compact"
        >
          <template #append>
            <VBtn size="small" variant="text" @click="emit('retry')">Retry</VBtn>
          </template>
          <template #text>
            <p class="repo-details__error-text">
              {{
                errorVariant === 'rate-limit'
                  ? 'Core rate limit reached.'
                  : 'Failed to load details.'
              }}
            </p>
          </template>
        </VAlert>
      </div>

      <div class="repo-details__content">
        <div class="repo-details__header">
          <div class="repo-details__header-identity">
            <VAvatar rounded="sm" size="40">
              <VImg :alt="repo.owner.login" :src="repo.owner.avatar_url" />
            </VAvatar>
            <div>
              <a
                class="repo-details__owner"
                :href="repo.owner.html_url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ repo.owner.login }}
              </a>
              <div class="repo-details__name">
                <span>{{ repo.owner.login }}</span>
                <span>/</span>
                <span class="repo-details__name-emphasis">{{ repoShortName }}</span>
              </div>
            </div>
          </div>

          <div class="repo-details__actions">
            <VBtn
              variant="flat"
              color="primary"
              prepend-icon="mdi-open-in-new"
              size="small"
              target="_blank"
              rel="noopener noreferrer"
              :href="repo.html_url"
            >
              Open on GitHub
            </VBtn>
            <VBtn
              v-if="repo.homepage"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-web"
              size="small"
              target="_blank"
              rel="noopener noreferrer"
              :href="repo.homepage"
            >
              Visit Homepage
            </VBtn>
          </div>
        </div>

        <VRow>
          <VCol cols="12">
            <p v-if="repo.description" class="repo-details__description">
              {{ repo.description }}
            </p>
          </VCol>

          <VCol v-if="repo.topics.length" cols="12">
            <div class="repo-details__chip-list">
              <VChip
                v-for="topic of repo.topics"
                :key="topic"
                size="small"
                variant="tonal"
                color="primary"
              >
                {{ topic }}
              </VChip>
            </div>
          </VCol>

          <VCol v-if="featureBadges.length" cols="12">
            <div class="repo-details__chip-list">
              <VChip
                v-for="badge in featureBadges"
                :key="badge.label"
                :color="badge.color"
                :prepend-icon="badge.icon"
                size="small"
                variant="tonal"
              >
                {{ badge.label }}
              </VChip>
            </div>
          </VCol>

          <VCol cols="12">
            <DetailSection>
              <div class="repo-details__stats-grid">
                <div v-for="detail in details" :key="detail.code" class="repo-details__stat">
                  <span class="repo-details__stat-label">
                    <VIcon v-if="detail.icon" size="14">{{ detail.icon }}</VIcon>
                    {{ detail.label }}
                  </span>
                  <span class="repo-details__stat-value">{{ detail.value }}</span>
                </div>
              </div>
            </DetailSection>
          </VCol>

          <VCol v-if="languageItems.length" cols="12">
            <DetailSection title="Languages">
              <div class="repo-details__languages">
                <span
                  v-for="lang in languageItems"
                  :key="lang.name"
                  class="repo-details__lang-item"
                >
                  <span
                    class="repo-details__lang-dot"
                    :style="{ backgroundColor: langColor(lang.name) }"
                  />
                  <span class="repo-details__lang-name">{{ lang.name }}</span>
                  <span class="repo-details__lang-sep">·</span>
                  <span class="repo-details__lang-pct">{{ lang.pct }}%</span>
                </span>
              </div>
            </DetailSection>
          </VCol>

          <VCol v-if="cloneFields.length" cols="12">
            <DetailSection title="Clone">
              <div class="repo-details__clone-fields">
                <VTextField
                  v-for="field in cloneFields"
                  :key="field.key"
                  :model-value="field.url"
                  readonly
                  density="compact"
                  variant="outlined"
                  :label="field.label"
                  hide-details
                  class="repo-details__clone-field"
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
          </VCol>
        </VRow>
      </div>
    </template>

    <template v-else>
      <VEmptyState
        text-width="360"
        text="Once results appear on the left, select a repository to view details."
      >
        <template #media>
          <VAvatar rounded="sm" size="48" variant="text">
            <VIcon size="44">{{ 'mdi-package-variant' }}</VIcon>
          </VAvatar>
        </template>
        <template #title>
          <h2 class="repo-details__empty-title">Nothing to show</h2>
        </template>
      </VEmptyState>
    </template>
  </VContainer>
</template>

<style lang="scss">
.repo-details {
  background-color: var(--color-background-muted);
  display: flex;
  flex-direction: column;
  height: 100%;

  &__progress {
    height: 2px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
  }

  &__actions {
    flex: 0 0 auto;
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    line-height: var(--line-height-tight);
    align-items: center;
    padding-top: var(--space-2);
    padding-bottom: var(--space-4);

    @media (max-width: 599px) {
      .repo-details__actions {
        flex-basis: 100%;
      }
    }
  }

  &__header-identity {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1 1 auto;
    min-width: 0;
  }

  &__name {
    color: var(--color-text-secondary);
    word-break: break-all;
    font-size: var(--font-size-h5);
  }

  &__name-emphasis {
    color: var(--color-text);
    font-weight: var(--font-weight-bold);
  }

  &__owner {
    font-size: var(--font-size-caption);
    text-decoration: none;
    color: var(--color-text);

    &:hover {
      color: rgba(var(--v-theme-primary));
      text-decoration: underline;
      transition: color 0.2s ease-out;
    }
  }

  &__description {
    font-size: var(--font-size-body-sm);
  }

  &__chip-list {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  &__stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);

    @media (min-width: 960px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__stat-label {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__stat-value {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body-sm);
  }

  &__languages {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
  }

  &__lang-item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--font-size-body-sm);
  }

  &__lang-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
  }

  &__lang-sep {
    color: var(--color-text-secondary);
  }

  &__lang-name {
    color: var(--color-text);
  }

  &__lang-pct {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  &__clone-fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding-block: var(--space-2);
  }

  &__clone-field {
    font-family: monospace;
    font-size: var(--font-size-caption);
  }

  &__error {
    margin-bottom: var(--space-3);
  }

  &__error-text {
    font-size: var(--font-size-body-sm);
  }

  &__empty-title {
    font-size: var(--font-size-h6);
    margin-top: var(--space-4);
  }
}
</style>
