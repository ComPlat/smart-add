import Home from '../../src/app/page'

describe('<Home />', () => {
  it('has SmartAdd logo', () => {
    cy.mount(<Home />)
    cy.get('img[alt="SmartAdd Logo"]').should('exist')
  })
})
