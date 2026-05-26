/// <reference types="cypress" />

import '@testing-library/cypress/add-commands'
import type { GetRepositoryResponse, SearchRepositoriesResponse } from '@/types/github'
import { githubRepoResult, githubSearchResults } from '@/testing/fixtures/repositories'

export interface MockGitHubSearchOptions {
  statusCode?: number
  body?: Partial<SearchRepositoriesResponse>
}

export interface MockGitHubRepoOptions {
  statusCode?: number
  body?: Partial<GetRepositoryResponse>
}

export interface MockGitHubLanguagesOptions {
  statusCode?: number
  body?: Record<string, number>
}

Cypress.Commands.add('mockGitHubSearch', (options: MockGitHubSearchOptions = {}) => {
  cy.intercept('GET', '**/search/repositories**', {
    statusCode: options.statusCode ?? 200,
    body: options.body ?? githubSearchResults,
  }).as('searchRepos')
})

Cypress.Commands.add('mockGitHubRepo', (options: MockGitHubRepoOptions = {}) => {
  cy.intercept({ method: 'GET', url: /\/repos\/[^/]+\/[^/]+$/ }, {
    statusCode: options.statusCode ?? 200,
    body: options.body ?? githubRepoResult,
  }).as('getRepo')
})

Cypress.Commands.add('mockGitHubLanguages', (options: MockGitHubLanguagesOptions = {}) => {
  cy.intercept({ method: 'GET', url: /\/repos\/[^/]+\/[^/]+\/languages$/ }, {
    statusCode: options.statusCode ?? 200,
    body: options.body ?? { JavaScript: 5000, TypeScript: 3000 },
  }).as('getLanguages')
})
