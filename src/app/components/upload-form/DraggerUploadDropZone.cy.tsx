import React from 'react'
import { UploadDropZone } from './Dragger'

describe('<UploadDropZone />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<UploadDropZone />)
  })
})