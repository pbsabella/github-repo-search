/// <reference types="cypress" />

import '@testing-library/cypress/add-commands'
import type { GetRepositoryResponse, SearchRepositoriesResponse } from '@/types/github'
import { githubRepoResult, githubSearchResults } from '../fixtures/repositories'

export interface MockGitHubSearchOptions {
  statusCode?: number
  body?: Partial<SearchRepositoriesResponse>
}

export interface MockGitHubRepoOptions {
  statusCode?: number
  body?: Partial<GetRepositoryResponse>
}

Cypress.Commands.add('mockGitHubSearch', (options: MockGitHubSearchOptions = {}) => {
  cy.intercept('GET', '**/search/repositories**', {
    statusCode: options.statusCode ?? 200,
    body: options.body ?? githubSearchResults,
  }).as('searchRepos')
})

Cypress.Commands.add('mockGitHubRepo', (options: MockGitHubRepoOptions = {}) => {
  cy.intercept('GET', '**/repos/*/*', {
    statusCode: options.statusCode ?? 200,
    body: options.body ?? githubRepoResult,
  }).as('getRepo')
})
