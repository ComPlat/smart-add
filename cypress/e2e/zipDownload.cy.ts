import '@this-dot/cypress-indexeddb'

describe('ZIP download', () => {
  beforeEach(() => {
    cy.visit('/')
    // cy.wait(3000).clearIndexedDb('filesDatabase')
    // cy.visit('/').wait(3000).clearIndexedDb('assignmentsDatabase')
  })

  const outputZipName = 'exportZip'
  const zipFileName = 'test-zip.zip'
  const zipFile = `cypress/fixtures/${zipFileName}`

  after(() => {
    cy.exec(`rm -f cypress/downloads/${outputZipName}.zip`)
  })

  describe('uploading ZIP file', () => {
    it('downloads assignment tree as zip file', () => {
      cy.get('span[role=button]').selectFile(zipFile, {
        action: 'drag-drop',
      })

      cy.get('button[data-rct-item-id="test-zip.zip"]').click()
      cy.get('button[data-rct-item-id="test-zip.zip/test-zip"]').click()

      // cy.get('[role="tree"] > :nth-child(2) > .flex-col > .flex').should(
      //   'be.visible',
      // )

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

      // cy.get('button')
      //   .contains('Download as ZIP')
      //   .click()
      //   .readFile(`cypress/downloads/${outputZipName}.zip`)
      //   .then((fileContent) => {
      //     expect(fileContent).to.exist
      //   })
    })
  })
})
