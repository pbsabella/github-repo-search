import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useRepoDetails } from './useRepoDetails'
import type { LanguagesData } from '@/types/github'
import { mockRepositories } from '@/testing/fixtures/repositories'

const baseRepo = mockRepositories[0]!

describe('useRepoDetails', () => {
  describe('repoShortName', () => {
    it('extracts the segment after / from full_name', () => {
      const { repoShortName } = useRepoDetails(ref(baseRepo), ref(null))

      expect(repoShortName.value).toBe('react')
    })

    it('returns undefined when repo is null', () => {
      const { repoShortName } = useRepoDetails(ref(null), ref(null))

      expect(repoShortName.value).toBeUndefined()
    })
  })

  describe('cloneFields', () => {
    it('returns both HTTPS and SSH entries when both URLs are present', () => {
      const { cloneFields } = useRepoDetails(ref(baseRepo), ref(null))

      expect(cloneFields.value).toHaveLength(2)
      expect(cloneFields.value[0]).toMatchObject({ key: 'https', url: baseRepo.clone_url })
      expect(cloneFields.value[1]).toMatchObject({ key: 'ssh', url: baseRepo.ssh_url })
    })

    it('omits the SSH entry when ssh_url is empty', () => {
      const { cloneFields } = useRepoDetails(ref({ ...baseRepo, ssh_url: '' }), ref(null))

      expect(cloneFields.value).toHaveLength(1)
      expect(cloneFields.value[0]?.key).toBe('https')
    })

    it('returns empty array when repo is null', () => {
      const { cloneFields } = useRepoDetails(ref(null), ref(null))

      expect(cloneFields.value).toEqual([])
    })
  })

  describe('languageItems', () => {
    it('sorts by byte count descending and computes correct percentages', () => {
      const languages: LanguagesData = {
        JavaScript: 5000,
        TypeScript: 3000,
        HTML: 2000,
      }
      const { languageItems } = useRepoDetails(ref(baseRepo), ref(languages))

      expect(languageItems.value).toEqual([
        { name: 'JavaScript', pct: '50.0' },
        { name: 'TypeScript', pct: '30.0' },
        { name: 'HTML', pct: '20.0' },
      ])
    })

    it('filters out languages with 0 value', () => {
      const languages: LanguagesData = {
        JavaScript: 5000,
        CSS: 0,
      }
      const { languageItems } = useRepoDetails(ref(baseRepo), ref(languages))

      expect(languageItems.value.map((l) => l.name)).toEqual(['JavaScript'])
    })

    it('returns empty array when languages is null', () => {
      const { languageItems } = useRepoDetails(ref(baseRepo), ref(null))

      expect(languageItems.value).toEqual([])
    })

    it('returns empty array when all byte counts sum to 0', () => {
      const { languageItems } = useRepoDetails(ref(baseRepo), ref({ JavaScript: 0 }))

      expect(languageItems.value).toEqual([])
    })
  })

  describe('featureBadges', () => {
    it('returns empty array when no feature flags are set', () => {
      const repo = {
        ...baseRepo,
        archived: false,
        is_template: false,
        has_pages: false,
        has_discussions: false,
        has_wiki: false,
      }
      const { featureBadges } = useRepoDetails(ref(repo), ref(null))

      expect(featureBadges.value).toEqual([])
    })

    it('returns only badges for truthy flags', () => {
      const repo = {
        ...baseRepo,
        archived: true,
        is_template: true,
        has_pages: true,
      }
      const { featureBadges } = useRepoDetails(ref(repo), ref(null))

      expect(featureBadges.value.map((b) => b.label)).toEqual([
        'Archived',
        'Template',
        'Pages',
      ])
    })

    it('sets color warning on the Archived badge', () => {
      const { featureBadges } = useRepoDetails(ref({
        ...baseRepo,
        archived: true,
      }), ref(null))

      expect(featureBadges.value[0]?.color).toBe('warning')
    })

    it('returns all five badges when all flags are set', () => {
      const repo = {
        ...baseRepo,
        archived: true,
        is_template: true,
        has_pages: true,
        has_discussions: true,
        has_wiki: true,
      }
      const { featureBadges } = useRepoDetails(ref(repo), ref(null))

      expect(featureBadges.value.map((b) => b.label)).toEqual([
        'Archived',
        'Template',
        'Pages',
        'Discussions',
        'Wiki',
      ])
    })

    it('returns empty array when repo is null', () => {
      const { featureBadges } = useRepoDetails(ref(null), ref(null))

      expect(featureBadges.value).toEqual([])
    })
  })

  describe('details', () => {
    it('shows N/A for license when repo.license is null', () => {
      const { details } = useRepoDetails(
        ref({
          ...baseRepo,
          license: null,
        }),
        ref(null),
      )
      const license = details.value.find((d) => d.code === 'license')

      expect(license?.value).toBe('N/A')
    })

    it('shows dash for pushed_at when it is null', () => {
      const { details } = useRepoDetails(
        ref({
          ...baseRepo,
          pushed_at: null,
        }),
        ref(null),
      )
      const pushed = details.value.find((d) => d.code === 'pushed')

      expect(pushed?.value).toBe('-')
    })

    it('returns empty array when repo is null', () => {
      const { details } = useRepoDetails(ref(null), ref(null))

      expect(details.value).toEqual([])
    })
  })
})
