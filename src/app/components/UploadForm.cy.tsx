import React from 'react'
import { UploadForm } from './UploadForm'

describe('<UploadForm />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<UploadForm />)
  })
})