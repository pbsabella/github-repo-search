/// <reference types="cypress" />

import '@testing-library/cypress/add-commands'
import type { SearchRepositoriesResponse } from '@/types/github'
import { githubSearchResults } from '../fixtures/repositories'

export interface MockGitHubSearchOptions {
  statusCode?: number
  body?: Partial<SearchRepositoriesResponse>
}

Cypress.Commands.add('mockGitHubSearch', (options: MockGitHubSearchOptions = {}) => {
  cy.intercept('GET', '**/search/repositories**', {
    statusCode: options.statusCode ?? 200,
    body: options.body ?? githubSearchResults,
  }).as('searchRepos')
})
