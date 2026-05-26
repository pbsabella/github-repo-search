import TheHeader from './TheHeader.vue'
import { useRateLimitStore } from '@/stores/rateLimit'

const searchHeaders = (remaining: number, limit = 30) => ({
  'x-ratelimit-resource': 'search',
  'x-ratelimit-remaining': String(remaining),
  'x-ratelimit-limit': String(limit),
  'x-ratelimit-reset': '1700000000',
})

const coreHeaders = (remaining: number, limit = 5000) => ({
  'x-ratelimit-resource': 'core',
  'x-ratelimit-remaining': String(remaining),
  'x-ratelimit-limit': String(limit),
  'x-ratelimit-reset': '1700000000',
})

describe('<TheHeader />', () => {

  it('renders the project title in the banner', () => {
    cy.mount(TheHeader)

    cy.findByRole('heading', { name: 'GitHub Repo Search', level: 1 })
  })

  it('shows dash in search chip when no API data available', () => {
    cy.mount(TheHeader)

    cy.findByLabelText('Search rate limit').should('be.visible').and('contain', '-')
  })

  it('shows dash in core chip when no API data available', () => {
    cy.mount(TheHeader)

    cy.findByLabelText('Core rate limit').should('be.visible').and('contain', '-')
  })

  it('search chip reflects updated remaining count', () => {
    cy.mount(TheHeader).then(() => {
      useRateLimitStore().update(searchHeaders(8))
    })

    cy.findByLabelText('Search rate limit').should('contain', '8')
  })

  it('core chip reflects updated remaining count', () => {
    cy.mount(TheHeader).then(() => {
      useRateLimitStore().update(coreHeaders(4500))
    })

    cy.findByLabelText('Core rate limit').should('contain', '4500')
  })

  it('search chip has no color when no data', () => {
    cy.mount(TheHeader)

    cy.findByLabelText('Search rate limit').should('be.visible')
      .and('not.have.class', 'bg-warning')
      .and('not.have.class', 'bg-error')
  })

  it('search chip color is warning when rate limit is low (< 5)', () => {
    cy.mount(TheHeader).then(() => {
      useRateLimitStore().update(searchHeaders(4))
    })

    cy.findByLabelText('Search rate limit').should('have.class', 'bg-warning')
  })

  it('search chip color is error when rate limit is empty', () => {
    cy.mount(TheHeader).then(() => {
      useRateLimitStore().update(searchHeaders(0))
    })

    cy.findByLabelText('Search rate limit').should('have.class', 'bg-error')
  })

  it('core chip color is warning when rate limit is low (< 10)', () => {
    cy.mount(TheHeader).then(() => {
      useRateLimitStore().update(coreHeaders(9))
    })

    cy.findByLabelText('Core rate limit').should('have.class', 'bg-warning')
  })

  it('core chip color is error when rate limit is empty', () => {
    cy.mount(TheHeader).then(() => {
      useRateLimitStore().update(coreHeaders(0))
    })

    cy.findByLabelText('Core rate limit').should('have.class', 'bg-error')
  })

  it('shows "Search:" and "Core:" labels in full mode', () => {
    cy.mount(TheHeader, { props: { compact: false } }).then(() => {
      const store = useRateLimitStore()
      store.update(searchHeaders(20))
      store.update(coreHeaders(4000))
    })

    cy.findByLabelText('Search rate limit').should('contain', 'Search:')
    cy.findByLabelText('Core rate limit').should('contain', 'Core:')
  })

  it('hides pool labels when compact', () => {
    cy.mount(TheHeader, { props: { compact: true } }).then(() => {
      const store = useRateLimitStore()
      store.update(searchHeaders(20))
      store.update(coreHeaders(4000))
    })

    cy.findByLabelText('Search rate limit').should('not.contain', 'Search:')
    cy.findByLabelText('Core rate limit').should('not.contain', 'Core:')
  })

  it('both chips are visible simultaneously', () => {
    cy.mount(TheHeader).then(() => {
      const store = useRateLimitStore()
      store.update(searchHeaders(20))
      store.update(coreHeaders(4000))
    })

    cy.findByLabelText('Search rate limit').should('be.visible').and('contain', '20')
    cy.findByLabelText('Core rate limit').should('be.visible').and('contain', '4000')
  })

})
