import { githubSearchResults, paginatedSearchResults } from '../fixtures/repositories'

describe('SearchDashboard view', () => {

  describe('search results section', () => {

    it('displays the initial empty state on app root url', () => {
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).should('be.visible')

      // List
      cy.findByRole('heading', { level: 2, name: 'Ready to explore?' }).should('be.visible')

      // Details
      cy.findByRole('heading', { level: 2, name: 'Nothing to show' }).should('be.visible')
    })

    it('displays repo cards after a successful search', () => {
      cy.mockGitHubSearch()
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')

      cy.wait('@searchRepos')

      cy.findByRole('list', { name: 'Search results' }).should('be.visible')
      cy.findByText('facebook/react').should('be.visible')

      // Details - nothing is preselected
      cy.findByRole('heading', { level: 2, name: 'Nothing to show' }).should('be.visible')
    })

    it('displays the no-results state when the API returns an empty items array', () => {
      cy.mockGitHubSearch({ body: { total_count: 0, items: [] } })
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).type('no-match{enter}')

      cy.wait('@searchRepos')

      cy.findByRole('heading', { level: 2, name: 'No results found' }).should('be.visible')
    })

    it('does not trigger a search when the input is blank', () => {
      cy.mockGitHubSearch()
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).type('   {enter}')

      cy.get('@searchRepos.all').should('have.length', 0)
    })

    it('shows pagination controls and loads page 2', () => {
      cy.intercept('GET', '**/search/repositories**', { body: { ...githubSearchResults, total_count: 25 } }).as('searchPage1')
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')
      cy.wait('@searchPage1')

      cy.intercept('GET', '**/search/repositories**', { body: paginatedSearchResults }).as('searchPage2')

      cy.findByRole('button', { name: 'Go to page 2' }).click()
      cy.wait('@searchPage2')

      cy.findByText('org/repo-page-2').should('be.visible')
    })

    it('displays the error state when the API returns a 500 and retry is attempted when button is clicked', () => {
      cy.mockGitHubSearch({ statusCode: 500 })
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')

      cy.wait('@searchRepos')

      cy.findByRole('heading', { level: 2, name: 'Something went wrong' }).should('be.visible')

      // Details - error is limited to search results section
      cy.findByRole('heading', { level: 2, name: 'Nothing to show' }).should('be.visible')

      // Retry
      cy.mockGitHubSearch()
      cy.findByRole('button', { name: 'Retry' })
        .should('be.visible')
        .click()
      cy.wait('@searchRepos')

      cy.findByRole('list', { name: 'Search results' }).should('be.visible')
      cy.findByRole('heading', { level: 2, name: 'Something went wrong' }).should('not.exist')
    })

    it('shows the rate limit error state when the API reports remaining 0', () => {
      cy.intercept('GET', '**/search/repositories**', {
        statusCode: 403,
        headers: {
          'x-ratelimit-resource': 'search',
          'x-ratelimit-limit': '10',
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1700000000',
        },
      }).as('searchRepos')
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')
      cy.wait('@searchRepos')

      cy.findByRole('heading', { name: 'Rate limit reached', level: 2 }).should('be.visible')
    })

    it('shows the page error snackbar when a pagination request fails', () => {
      cy.intercept('GET', '**/search/repositories**', { body: { ...githubSearchResults, total_count: 25 } }).as('searchPage1')
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')
      cy.wait('@searchPage1')

      cy.intercept('GET', '**/search/repositories**', { statusCode: 500 }).as('searchPage2')

      cy.findByRole('button', { name: 'Go to page 2' }).click()
      cy.wait('@searchPage2')

      cy.findByRole('status').should('be.visible')
    })

  })

  describe('selected details section', () => {

    beforeEach(() => {
      cy.mockGitHubSearch()
      cy.visit('/')

      cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')
      cy.wait('@searchRepos')
    })

    it('displays the repo details side panel when a result card is clicked', () => {
      cy.mockGitHubRepo()
      cy.findByRole('listitem', { name: 'View details for facebook/react' }).click()
      cy.wait('@getRepo')

      cy.findByRole('link', { name: 'Open on GitHub' }).should('be.visible')
    })

    it('displays the partial data and error message when the repo API returns a 500 and attempts retry on click', () => {
      cy.mockGitHubRepo({ statusCode: 500 })
      cy.findByRole('listitem', { name: 'View details for facebook/react' }).click()

      cy.findByRole('link', { name: 'Open on GitHub' }).should('be.visible')

      cy.findByRole('alert').contains('Failed to load details.')

      // Retry
      cy.mockGitHubRepo()
      cy.findByRole('button', { name: 'Retry' }).click()
      cy.wait('@getRepo')

      cy.findByRole('alert').should('not.exist')
    })

  })

})
