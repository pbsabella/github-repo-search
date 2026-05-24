import SidePanel from './SidePanel.vue'

// TODO: The dialog is not displayed within the viewport, but it exists in the DOM

describe('<SidePanel />', () => {
  beforeEach(() => {
    cy.viewport(1200, 800)
  })

  it('renders the dialog when modelValue is true', () => {
    cy.mount(SidePanel, {
      props: { modelValue: true },
    })

    cy.findByRole('dialog').should('be.visible')
  })

  it('does not render the dialog when modelValue is false', () => {
    cy.mount(SidePanel, {
      props: { modelValue: false },
    })

    cy.findByRole('dialog').should('not.exist')
  })

  it('renders slot content inside the dialog', () => {
    cy.mount(SidePanel, {
      props: { modelValue: true },
      slots: { default: '<p style="padding-right: 48px;">Custom content</p>' },
    })

    cy.findByText('Custom content').should('exist')
  })

  it('emits update:modelValue when close button is clicked', () => {
    const onUpdate = cy.spy().as('updateSpy')

    cy.mount(SidePanel, {
      props: {
        modelValue: true,
        'onUpdate:modelValue': onUpdate,
      },
    })

    cy.findByRole('button', { name: 'Close panel' }).click({ force: true })

    cy.get('@updateSpy').should('have.been.calledWith', false)
  })

  it('emits update:modelValue when pressing Escape', () => {
    const onUpdate = cy.spy().as('updateSpy')

    cy.mount(SidePanel, {
      props: {
        modelValue: true,
        'onUpdate:modelValue': onUpdate,
      },
    })

    cy.get('body').type('{esc}')

    cy.get('@updateSpy').should('have.been.calledWith', false)
  })
})
