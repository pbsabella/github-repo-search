import RepoDetails from './RepoDetails.vue'
import { mockRepositories } from '../../../cypress/fixtures/repositories'
import { formatCompactCount, formatDate } from '@/utils/format'

const mockRepo = mockRepositories[0];

describe('<RepoDetails />', () => {

  it('renders the empty state when repo prop is not provided', () => {
    cy.mount(RepoDetails)

    cy.findByText('Select a repository to view details.').should('be.visible');
  })

  it('renders the formatted repo details provided', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: mockRepo,
      }
    })

    cy.findByText('react').should('be.visible');
    cy.findByText(mockRepo.description).should('be.visible');
    cy.findByRole('link', { name: mockRepo.owner.login }).should('be.visible');

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

    cy.findByText('Created').should('be.visible')
      .next()
      .findByText(formatDate(mockRepo.created_at)).should('be.visible')

    cy.findByText('Updated').should('be.visible')
      .next()
      .findByText(formatDate(mockRepo.updated_at)).should('be.visible')

    cy.findByText('Topics').should('be.visible')
    cy.findByText(mockRepo.topics[0]).should('be.visible')
    cy.findByText(mockRepo.topics[1]).should('be.visible')

    cy.findByRole('link', { name: 'Go to GitHub' }).should('be.visible')
  })

  it('owner link points to the owner html_url', () => {
    cy.mount(RepoDetails, { props: { repo: mockRepo } })

    cy.findByRole('link', { name: mockRepo.owner.login })
      .should('have.attr', 'href', mockRepo.owner.html_url)
  })

  it('Go to GitHub button links to the repo html_url', () => {
    cy.mount(RepoDetails, { props: { repo: mockRepo } })

    cy.findByRole('link', { name: 'Go to GitHub' })
      .should('have.attr', 'href', mockRepo.html_url)
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

  it('renders hides topics when not provided', () => {
    cy.mount(RepoDetails, {
      props: {
        repo: {
          ...mockRepo,
          topics: [],
        },
      }
    })

    cy.findByText('Topics').should('not.exist')
  })

})
