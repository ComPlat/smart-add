import Home from '../../src/app/page'

describe('<Home />', () => {
  it('renders', () => {
    cy.mount(<Home />)
  })

  it('has headline', () => {
    cy.mount(<Home />)
    cy.get('h1').contains('Smart Add')
  })
})
