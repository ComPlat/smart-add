import '@this-dot/cypress-indexeddb'

describe('ZIP download', () => {
  beforeEach(() => {
    cy.visit('/').clearIndexedDb('filesDatabase')
  })

  describe('uploading ZIP file', () => {
    const zipFileName = 'test-zip.zip'
    const zipFile = `cypress/fixtures/${zipFileName}`
    it('uploads and downloads a ZIP file', () => {
      cy.get('span[role=button]')
        .selectFile(zipFile, {
          action: 'drag-drop',
        })
        .get('button')
        .contains('Download as Zip')
        .click()
        .get('.ant-message-success')
        .should('contain', `${zipFileName} uploaded successfully`)
        .get('.ant-message-success')
        .should('contain', `${zipFileName} downloaded successfully`)
        .readFile(`cypress/downloads/${zipFileName}`)
        .then((fileContent) => {
          expect(fileContent).to.exist
        })
      cy.exec(`rm -f cypress/downloads/${zipFileName}`)
    })
  })
})
