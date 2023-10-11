import '@this-dot/cypress-indexeddb'

describe('ZIP Upload', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  afterEach(() => {
    cy.clearIndexedDb('filesDatabase')
  })

  describe('uploading zip file', () => {
    const zipFileName = 'test-zip.zip'
    const zipFile = `cypress/fixtures/${zipFileName}`

    it('xlsx file upload', () => {
      cy.get('span[role=button]').selectFile(zipFile, {
        action: 'drag-drop',
      })
      cy.get('p').should('contain', '2023_SmartAdd.mol')
    })
  })
})
