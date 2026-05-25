import { computed } from 'vue'
import type { Ref } from 'vue'
import type { GitHubRepo, LanguagesData } from '@/types/github'
import { formatCompactCount, formatDate } from '@/utils/format'

export type RepoDetail = {
  code: string
  label: string
  value: string
  icon?: string
}

export type Badge = {
  label: string
  color?: string
  icon: string
}

export type CloneField = {
  label: string
  key: 'https' | 'ssh'
  url: string
}

export const useRepoDetails = (
  repo: Ref<GitHubRepo | null | undefined>,
  languages: Ref<LanguagesData | null | undefined>,
) => {
  const repoShortName = computed(() => repo.value?.full_name.split('/')[1])

  const cloneFields = computed<CloneField[]>(() => {
    if (!repo.value) {
      return []
    }

    const fields: CloneField[] = []

    if (repo.value.clone_url) {
      fields.push({ label: 'HTTPS', key: 'https', url: repo.value.clone_url })
    }

    if (repo.value.ssh_url) {
      fields.push({ label: 'SSH', key: 'ssh', url: repo.value.ssh_url })
    }

    return fields
  })

  const languageItems = computed(() => {
    const data = languages.value

    if (!data) {
      return []
    }

    const total = Object.values(data)
      .reduce((sum: number, n: number) => sum + n, 0)

    if (total === 0) {
      return []
    }

    return Object.keys(data)
      .sort((a, b) => (data[b] ?? 0) - (data[a] ?? 0))
      .map((name) => ({
        name,
        pct: (((data[name] ?? 0) / total) * 100).toFixed(1),
      }))
      .filter(({ pct }) => parseFloat(pct) > 0) // Remove 0 or insignificant figures
  })

  const featureBadges = computed<Badge[]>(() => {
    if (!repo.value) {
      return []
    }

    const badges: Badge[] = []

    if (repo.value.archived) {
      badges.push({
        label: 'Archived',
        color: 'warning',
        icon: 'mdi-archive-outline',
      })
    }

    if (repo.value.is_template) {
      badges.push({
        label: 'Template',
        icon: 'mdi-content-copy',
      })
    }

    if (repo.value.has_pages) {
      badges.push({
        label: 'Pages',
        icon: 'mdi-web',
      })
    }

    if (repo.value.has_discussions) {
      badges.push({
        label: 'Discussions',
        icon: 'mdi-forum-outline',
      })
    }

    if (repo.value.has_wiki) {
      badges.push({
        label: 'Wiki',
        icon: 'mdi-book-open-outline',
      })
    }

    return badges
  })

  const details = computed<RepoDetail[]>(() => {
    if (!repo.value) {
      return []
    }

    return [
      {
        code: 'stars',
        label: 'Stars',
        value: formatCompactCount(repo.value.stargazers_count),
        icon: 'mdi-star',
      },
      {
        code: 'watchers',
        label: 'Watchers',
        value: formatCompactCount(repo.value.watchers_count),
        icon: 'mdi-eye-outline',
      },
      {
        code: 'open-issues',
        label: 'Open Issues',
        value: formatCompactCount(repo.value.open_issues_count),
        icon: 'mdi-bug-outline',
      },
      {
        code: 'license',
        label: 'License',
        value: repo.value.license?.spdx_id ?? 'N/A',
        icon: 'mdi-scale-balance',
      },
      {
        code: 'forks',
        label: 'Forks',
        value: repo.value.forks_count != null ? formatCompactCount(repo.value.forks_count) : '-',
        icon: 'mdi-source-fork',
      },
      {
        code: 'created',
        label: 'Created',
        value: formatDate(repo.value.created_at),
        icon: 'mdi-calendar-plus',
      },
      {
        code: 'updated',
        label: 'Updated',
        value: formatDate(repo.value.updated_at),
        icon: 'mdi-calendar-edit',
      },
      {
        code: 'pushed',
        label: 'Last Pushed',
        value: repo.value.pushed_at ? formatDate(repo.value.pushed_at) : '-',
        icon: 'mdi-source-commit',
      },
    ]
  })

  return { repoShortName, cloneFields, languageItems, featureBadges, details }
}
