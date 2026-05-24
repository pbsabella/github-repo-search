/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    mockGitHubSearch(options?: import('./commands').MockGitHubSearchOptions): Chainable<null>
    mount(
      component: import('vue').Component,
      options?: import('@vue/test-utils').MountingOptions<Record<string, unknown>>,
    ): Cypress.Chainable
  }
}
