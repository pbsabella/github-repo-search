import StatCard from './StatCard.vue'

describe('<StatCard />', () => {

  it('renders the provided label and value', () => {
    cy.mount(StatCard, {
      props: {
        label: 'Some label',
        value: 'Some value'
      }
    })

    cy.findByText('Some label').should('be.visible')
    cy.findByText('Some value').should('be.visible')
  })

})
