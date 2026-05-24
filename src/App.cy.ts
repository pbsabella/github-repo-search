import App from './App.vue'
import { useRateLimitStore } from '@/stores/rateLimit'

describe('<App />', () => {

  it('does not show the rate limit banner by default', () => {
    cy.mount(App)

    cy.findByRole('alert', { name: 'System error' }).should('not.exist')
  })

  it('shows the rate limit banner when isEmpty is true', () => {
    cy.mount(App).then(() => {
      const store = useRateLimitStore()
      store.remaining = 0
      store.limit = 60
    })

    cy.findByRole('alert', { name: 'System error' }).should('be.visible').and('contain', 'rate limit reached')
  })

  it('shows the reset time in the banner when resetAt is set', () => {
    const unix = 1700000000
    cy.mount(App).then(() => {
      const store = useRateLimitStore()
      store.remaining = 0
      store.limit = 60
      store.resetAt = unix
    })

    const expectedTime = new Date(unix * 1000).toLocaleTimeString()
    cy.findByRole('alert', { name: 'System error' }).should('contain', expectedTime)
  })

  it('hides the banner once rate limit is no longer empty', () => {
    cy.mount(App).then(() => {
      const store = useRateLimitStore()
      store.remaining = 0
      store.limit = 60
    })

    cy.findByRole('alert', { name: 'System error' }).should('be.visible')

    cy.then(() => {
      const store = useRateLimitStore()
      store.remaining = 10
    })

    cy.findByRole('alert', { name: 'System error' }).should('not.exist')
  })

})
