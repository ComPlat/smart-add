import React from 'react'
import { FileList } from './FileList'

describe('<FileList />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<FileList />)
  })
})