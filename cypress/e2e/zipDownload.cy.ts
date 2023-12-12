import '@this-dot/cypress-indexeddb'

describe('ZIP download', () => {
  beforeEach(() => {
    cy.visit('/').clearIndexedDb('filesDatabase')
    cy.visit('/').clearIndexedDb('assignmentsDatabase')
  })

  const ouputZipName = 'exportZip'
  const zipFileName = 'test-zip.zip'
  const zipFile = `cypress/fixtures/${zipFileName}`

  after(() => {
    cy.exec(`rm -f cypress/downloads/${ouputZipName}.zip`)
  })

  describe('uploading ZIP file', () => {
    it('downloads assignment tree as zip file', () => {
      cy.get('span[role=button]').selectFile(zipFile, {
        action: 'drag-drop',
      })

      const dataTransfer = new DataTransfer()

      cy.get('[data-rct-item-id="test-zip.zip"] > .truncate').trigger(
        'dragstart',
        { dataTransfer },
      )
      cy.get(':nth-child(2) > [role="tree"]')
        .trigger('dragover', {
          dataTransfer,
        })
        .trigger('drop', { dataTransfer })

      cy.get('button')
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
