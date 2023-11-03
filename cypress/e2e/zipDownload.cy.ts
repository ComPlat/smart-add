import '@this-dot/cypress-indexeddb'

describe('ZIP download', () => {
  beforeEach(() => {
    cy.visit('/').clearIndexedDb('filesDatabase')
  })

  describe('uploading ZIP file', () => {
    const ouputZipName = 'exportZip'
    const zipFileName = 'test-zip.zip'
    const zipFile = `cypress/fixtures/${zipFileName}`

    after(() => {
      cy.exec(`rm -f cypress/downloads/${ouputZipName}.zip`)
    })

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
        .should('contain', `${ouputZipName}.zip downloaded successfully`)
        .readFile(`cypress/downloads/${ouputZipName}.zip`)
        .then((fileContent) => {
          expect(fileContent).to.exist
        })
    })
  })
})
