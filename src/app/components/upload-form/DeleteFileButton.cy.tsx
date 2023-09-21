import React from 'react'
import { DeleteFileButton } from './DeleteFileButton'

describe('<DeleteFileButton />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<DeleteFileButton />)
  })
})