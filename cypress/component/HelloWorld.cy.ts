import HelloWorld from '../../src/components/HelloWorld.vue'

describe('<HelloWorld />', () => {
  it('renders the message prop', () => {
    cy.mount(HelloWorld, { props: { msg: 'Hello Cypress!' } })
    cy.get('h1').should('have.text', 'Hello Cypress!')
  })
})
