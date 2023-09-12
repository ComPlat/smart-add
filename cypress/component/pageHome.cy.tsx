import { UploadForm } from '@/app/components/UploadForm'

import Home from '../../src/app/page'

describe('<Home />', () => {
  it('has headline', () => {
    cy.mount(<Home />)
    cy.get('h1').contains('Upload')
  })

  it('has upload form', () => {
    cy.mount(<UploadForm />)
  })
})
