import { githubSearchResults, paginatedSearchResults } from '../fixtures/repositories'

describe('SearchDashboard view', () => {

  it('displays the initial empty state on app root url', () => {
    cy.visit('/')

    cy.findByRole('searchbox', { name: 'Search GitHub' }).should('be.visible')

    cy.findByRole('heading', { level: 2, name: 'Ready to explore?' }).should('be.visible')
    cy.findByText('Enter a repository name, owner, or topic in the search bar above to get started.').should('be.visible')
  })

  it('displays repo cards after a successful search', () => {
    cy.mockGitHubSearch()
    cy.visit('/')

    cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')

    cy.wait('@searchRepos')

    cy.findByText('facebook/react').should('be.visible')
  })

  it('displays the error state when the API returns a 500', () => {
    cy.mockGitHubSearch({ statusCode: 500 })
    cy.visit('/')

    cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')

    cy.wait('@searchRepos')

    cy.findByRole('heading', { level: 2, name: 'Something went wrong' }).should('be.visible')
  })

  it('displays the no-results state when the API returns an empty items array', () => {
    cy.mockGitHubSearch({ body: { total_count: 0, items: [] } })
    cy.visit('/')

    cy.findByRole('searchbox', { name: 'Search GitHub' }).type('no-match{enter}')

    cy.wait('@searchRepos')

    cy.findByRole('heading', { level: 2, name: 'No results found' }).should('be.visible')
  })

  it('displays the repo details side panel when a result card is clicked', () => {
    cy.mockGitHubSearch()
    cy.visit('/')

    cy.findByRole('searchbox', { name: 'Search GitHub' }).type('react{enter}')
    cy.wait('@searchRepos')

    cy.findByText('facebook/react').click()

    cy.findByRole('link', { name: 'Go to GitHub' }).should('be.visible')
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

  it('shows the rate limit error state when the API reports remaining 0', () => {
    cy.intercept('GET', '**/search/repositories**', {
      statusCode: 403,
      headers: {
        'x-ratelimit-limit': '60',
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
