import RepoList from './RepoList.vue'
import { mockRepositories, archivedRepo } from '@/testing/fixtures/repositories'
import { formatCompactCount } from '@/utils/format'

describe('<RepoList />', () => {

  it('renders the formatted list cards', () => {
    cy.mount(RepoList, {
      props: {
        items: mockRepositories,
        selectedId: null,
      }
    })

    cy.findByText(mockRepositories[0].full_name).should('be.visible')
    cy.findByText(mockRepositories[0].description!).should('be.visible')
    cy.findByText(formatCompactCount(mockRepositories[0].stargazers_count)).should('be.visible')
    cy.findByText(formatCompactCount(mockRepositories[0].watchers_count)).should('be.visible')
    cy.findByText(mockRepositories[0].language!).should('be.visible')

    cy.findByText(mockRepositories[1].full_name).should('be.visible')
    cy.findByText(mockRepositories[1].description!).should('be.visible')
    cy.findByText(formatCompactCount(mockRepositories[1].stargazers_count)).should('be.visible')
    cy.findByText(formatCompactCount(mockRepositories[1].watchers_count)).should('be.visible')
    cy.findByText(mockRepositories[1].language!).should('be.visible')
  })

  it('shows the archive badge on an archived repo', () => {
    cy.mount(RepoList, {
      props: {
        items: [archivedRepo],
        selectedId: null,
      },
    })

    cy.findByText('Archived').should('be.visible')
  })

  it('renders up to 5 topic chips', () => {
    const repoWithTopics = {
      ...mockRepositories[0],
      topics: ['react', 'ui', 'frontend', 'javascript', 'library', 'extra'],
    }

    cy.mount(RepoList, {
      props: {
        items: [repoWithTopics],
        selectedId: null,
      },
    })

    cy.findByText('react').should('be.visible')
    cy.findByText('library').should('be.visible')
    cy.findByText('extra').should('not.exist')
  })

  it('emits select-repo with the clicked repo', () => {
    const onSelectRepo = cy.spy().as('selectRepo')

    cy.mount(RepoList, {
      props: {
        items: mockRepositories,
        selectedId: null,
        onSelectRepo,
      },
    })

    cy.findByRole('listitem', { name: `View details for ${mockRepositories[0].full_name}` }).click()
    cy.get('@selectRepo').should('have.been.calledOnce')
  })

})
