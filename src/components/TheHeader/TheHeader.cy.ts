import TheHeader from './TheHeader.vue'
import { useRateLimitStore } from '@/stores/rateLimit'

describe('<TheHeader />', () => {

  it('renders the project title in the banner', () => {
    cy.mount(TheHeader)

    cy.findByRole('banner').contains('GitHub Repo Search')
  })

  it('shows rate limit chip with defaults (10 / 10)', () => {
    cy.mount(TheHeader)

    cy.findByLabelText('API rate limit').should('be.visible').and('contain', '10')
  })

  it('reflects updated remaining count', () => {
    cy.mount(TheHeader).then(() => {
      const store = useRateLimitStore()

      store.remaining = 8
      store.limit = 60
    })

    cy.findByLabelText('API rate limit').should('contain', '8')
  })

  it('chip color is success by default', () => {
    cy.mount(TheHeader)

    cy.findByLabelText('API rate limit').should('have.class', 'bg-success')
  })

  it('chip color is warning when rate limit is low', () => {
    cy.mount(TheHeader).then(() => {
      const store = useRateLimitStore()
      store.remaining = 5
      store.limit = 60
    })

    cy.findByLabelText('API rate limit').should('have.class', 'bg-warning')
  })

  it('chip color is error when rate limit is empty', () => {
    cy.mount(TheHeader).then(() => {
      const store = useRateLimitStore()
      store.remaining = 0
      store.limit = 60
    })

    cy.findByLabelText('API rate limit').should('have.class', 'bg-error')
  })

  it('shows full label text when not compact', () => {
    cy.mount(TheHeader, { props: { compact: false } })

    cy.findByLabelText('API rate limit').should('contain', 'Rate limit:')
  })

  it('hides full label text when compact', () => {
    cy.mount(TheHeader, { props: { compact: true } })

    cy.findByLabelText('API rate limit').should('not.contain', 'Rate limit:')
  })

})
