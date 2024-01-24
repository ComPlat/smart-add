import '@this-dot/cypress-indexeddb'

describe('ZIP Upload', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(3000).clearIndexedDb('filesDatabase')
  })

  describe('uploading zip file', () => {
    const zipFileName = 'test-zip.zip'
    const zipFile = `cypress/fixtures/${zipFileName}`

    it('xlsx file upload', () => {
      cy.get('span[role=button]').selectFile(zipFile, {
        action: 'drag-drop',
      })
      cy.get('button[data-rct-item-id="test-zip.zip"]').click()
      cy.get('button[data-rct-item-id="test-zip.zip/test-zip"]').click()
      cy.get('span').should('contain', '2023_SmartAdd.mol')
    })
  })
})
