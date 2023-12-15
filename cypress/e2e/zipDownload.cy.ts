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

      cy.get('[role="tree"] > :nth-child(2) > .flex-col > .flex').should(
        'be.visible',
      )

      const dataTransfer = new DataTransfer()

      cy.wait(1_000)

      cy.get('[role="tree"] > :nth-child(2) > .flex-col > .flex').trigger(
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
        .wait(1_000)
        .readFile(`cypress/downloads/${ouputZipName}.zip`)
        .then((fileContent) => {
          expect(fileContent).to.exist
        })
    })
  })
})
