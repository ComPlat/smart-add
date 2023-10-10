import '@this-dot/cypress-indexeddb'

describe('ZIP Upload', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(5_000)
  })

  afterEach(() => {
    cy.clearIndexedDb('filesDatabase')
  })

  describe('uploading zip file', () => {
    const zipFileName = 'example.zip'
    const zipFile = `cypress/fixtures/${zipFileName}`

    it('xlsx file upload', () => {
      cy.get('span[role=button]').selectFile(zipFile, {
        action: 'drag-drop',
      })
      cy.wait(5_000)
      cy.get('p').should('contain', 'jszip.js')
      cy.get('p').should('contain', 'pygments.css')
      cy.get('p').should('contain', 'Franz Kafka - The Metamorphosis.epub')
    })
  })
})
