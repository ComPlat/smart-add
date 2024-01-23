import '@this-dot/cypress-indexeddb'

describe('ZIP download', () => {
  beforeEach(() => {
    cy.visit('/').clearIndexedDb('filesDatabase')
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

      const dataTransfer = new DataTransfer()

      cy.get(
        '[data-rct-item-id="test-zip.zip/test-zip/2023_SmartAdd.mol"]',
      ).trigger('dragstart', {
        dataTransfer,
      })

      cy.get('[data-rct-tree="assignmentTree"]')
        .trigger('dragover', {
          dataTransfer,
        })
        .trigger('drop', { dataTransfer })

      cy.get('button[name="Download as ZIP"]')
        .click()
        .readFile(`cypress/downloads/${outputZipName}.zip`)
        .then((fileContent) => {
          expect(fileContent).to.exist
        })
    })
  })
})
