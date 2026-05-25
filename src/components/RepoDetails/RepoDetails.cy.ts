import RepoDetails from './RepoDetails.vue'
import { mockRepositories, archivedRepo } from '../../../cypress/fixtures/repositories'
import { formatCompactCount, formatDate } from '@/utils/format'
import { useRepoSearchStore } from '@/stores/repoSearch'
import { useRateLimitStore } from '@/stores/rateLimit'

const mockRepo = mockRepositories[0];

describe('<RepoDetails />', () => {

  it('renders the empty state when repo prop is not provided', () => {
    cy.mount(RepoDetails)

    cy.findByRole('heading', { level: 2, name: 'Nothing to show' }).should('be.visible');
  })

  it('renders the formatted repo details provided', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: mockRepo,
      }
    })

    cy.findByText('react').should('be.visible');
    cy.findByText(mockRepo.description!).should('be.visible');
    cy.findByRole('link', { name: mockRepo.owner.login }).should('be.visible');

    cy.findByRole('link', { name: 'Open on GitHub' })
      .should('be.visible')
      .should('have.attr', 'href', mockRepo.html_url)
    cy.findByRole('link', { name: 'Visit Homepage' })
      .should('be.visible')
      .should('have.attr', 'href', mockRepo.homepage)

    cy.findByText(mockRepo.topics[0]).should('be.visible')
    cy.findByText(mockRepo.topics[1]).should('be.visible')

    cy.findByText('Stars').should('be.visible')
      .next()
      .findByText(formatCompactCount(mockRepo.stargazers_count)).should('be.visible')

    cy.findByText('Watchers').should('be.visible')
      .next()
      .findByText(formatCompactCount(mockRepo.watchers_count)).should('be.visible')

    cy.findByText('Open Issues').should('be.visible')
      .next()
      .findByText(formatCompactCount(mockRepo.open_issues_count)).should('be.visible')

    cy.findByText('License').should('be.visible')
      .next()
      .findByText('MIT').should('be.visible')

    cy.findByText('Forks').should('be.visible')
      .next()
      .findByText(formatCompactCount(mockRepo.forks_count)).should('be.visible')

    cy.findByText('Created').should('be.visible')
      .next()
      .findByText(formatDate(mockRepo.created_at)).should('be.visible')

    cy.findByText('Updated').should('be.visible')
      .next()
      .findByText(formatDate(mockRepo.updated_at)).should('be.visible')

    cy.findByText('Last Pushed').should('be.visible')
      .next()
      .findByText(formatDate(mockRepo.pushed_at!)).should('be.visible')
  })

  it('owner link points to the owner html_url', () => {
    cy.mount(RepoDetails, { props: { repo: mockRepo } })

    cy.findByRole('link', { name: mockRepo.owner.login })
      .should('have.attr', 'href', mockRepo.owner.html_url)
  })

  it('renders the license as N/A when not provided', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: {
          ...mockRepo,
          license: null
        },
      }
    })

    cy.findByText('License').should('be.visible')
      .next()
      .findByText('N/A').should('be.visible')
  })

  it('shows a progress bar when detailsLoading is true', () => {
    cy.mount(RepoDetails, { props: { repo: mockRepo } })
      .then(() => {
        const store = useRepoSearchStore()
        store.detailsLoading = true
      })

    cy.findByRole('progressbar', { name: 'Loading repository details' }).should('be.visible')
  })

  it('shows an error alert with retry button when detailsError is true', () => {
    cy.mount(RepoDetails, { props: { repo: mockRepo } })
      .then(() => {
        const store = useRepoSearchStore()
        store.detailsError = true
      })

    cy.findByText('Failed to load details.').should('be.visible')
    cy.findByRole('button', { name: 'Retry' }).should('be.visible')
  })

  it('shows a rate-limit warning when core pool is empty', () => {
    cy.mount(RepoDetails, { props: { repo: mockRepo } })
      .then(() => {
        const store = useRepoSearchStore()
        store.detailsError = true
        const rateLimit = useRateLimitStore()
        rateLimit.update({
          'x-ratelimit-resource': 'core',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': '0',
        })
      })

    cy.findByText('Core rate limit reached.').should('be.visible')
  })

  it('renders feature badges when repo has them', () => {
    const badgeRepo = {
      ...mockRepo,
      archived: true,
      is_template: true,
      has_pages: true,
      has_discussions: true,
      has_wiki: true,
    }

    cy.mount(RepoDetails, { props: { repo: badgeRepo } })

    cy.findByText('Archived').should('be.visible')
    cy.findByText('Template').should('be.visible')
    cy.findByText('Pages').should('be.visible')
    cy.findByText('Discussions').should('be.visible')
    cy.findByText('Wiki').should('be.visible')
  })

  it('renders the Archived badge for an archived repo', () => {
    cy.mount(RepoDetails, { props: { repo: archivedRepo } })

    cy.findByText('Archived').should('be.visible')
  })

  it('renders language items when repoLanguages are set', () => {
    cy.mount(RepoDetails, { props: { repo: mockRepo } })
      .then(() => {
        const store = useRepoSearchStore()
        store.repoLanguages = { JavaScript: 5000, TypeScript: 3000, HTML: 2000 }
      })

    cy.findByText('JavaScript').should('be.visible')
    cy.findByText('TypeScript').should('be.visible')
    cy.findByText('HTML').should('be.visible')
    cy.contains('50.0%').should('be.visible')
    cy.contains('30.0%').should('be.visible')
    cy.contains('20.0%').should('be.visible')
  })

  it('renders HTTPS and SSH clone fields', () => {
    cy.mount(RepoDetails, { props: { repo: mockRepo } })

    cy.findByDisplayValue(mockRepo.clone_url).should('be.visible')
    cy.findByDisplayValue(mockRepo.ssh_url).should('be.visible')
  })

  it('shows only the HTTPS field when SSH url is absent', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: { ...mockRepo, ssh_url: '' },
      }
    })

    cy.findByDisplayValue(mockRepo.clone_url).should('be.visible')
    cy.findAllByText('SSH').should('have.length', 0)
  })

  it('copies clone URL to clipboard on click and shows check icon', () => {
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves()
    })

    cy.mount(RepoDetails, { props: { repo: mockRepo } })

    cy.findByRole('button', { name: 'HTTPS appended action' }).click()

    cy.window().its('navigator.clipboard.writeText').should('be.calledWith', mockRepo.clone_url)
    cy.get('.mdi-check').should('be.visible')
  })

  it('does not show the homepage button when homepage is null', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: { ...mockRepo, homepage: null },
      }
    })

    cy.findByRole('link', { name: 'Visit Homepage' }).should('not.exist')
  })

  it('shows fallback dash when pushed_at is null', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: { ...mockRepo, pushed_at: null },
      }
    })

    cy.findByText('Last Pushed').should('be.visible')
      .next()
      .findByText('-').should('be.visible')
  })

  it('does not render the languages section when repoLanguages are not set', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: mockRepo,
      }
    })

    cy.findByText('Languages').should('not.exist')
  })

  it('does not render the clone section when neither URL is provided', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: { ...mockRepo, clone_url: '', ssh_url: '' },
      }
    })

    cy.findByText('Clone').should('not.exist')
  })

})
