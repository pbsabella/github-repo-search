import DetailSection from './DetailSection.vue'

describe('<DetailSection />', () => {

  it('renders slot content', () => {
    cy.mount(DetailSection, {
      slots: { default: () => 'Hello world' },
    })

    cy.findByText('Hello world').should('be.visible')
  })

  it('renders the title when provided', () => {
    cy.mount(DetailSection, {
      props: { title: 'Languages' },
      slots: { default: () => 'JavaScript' },
    })

    cy.findByText('Languages').should('be.visible')
  })

  it('does not render a title when not provided', () => {
    cy.mount(DetailSection, {
      slots: { default: () => 'Content' },
    })

    cy.findByText('Content').should('be.visible')
    cy.get('.detail-section__title').should('not.exist')
  })

})
