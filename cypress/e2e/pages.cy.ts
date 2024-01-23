import '@this-dot/cypress-indexeddb'

describe('Pages', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearIndexedDb('filesDatabase')
  })

  describe('UploadForm', () => {
    const fileName = 'file.json'
    const fileFixturePath = `cypress/fixtures/${fileName}`

    context('when uploading per drag and drop', () => {
      beforeEach(() => {
        cy.get('span[role=button]').selectFile(fileFixturePath, {
          action: 'drag-drop',
        })
      })

      it('shows message that upload was successful', () => {
        cy.get('.ant-message-success').should(
          'contain',
          `${fileName} uploaded successfully`,
        )
        cy.get('span').should('contain', fileName)
      })

      it('fills IndexedDB database', () => {
        cy.openIndexedDb('filesDatabase').createObjectStore('files').as('files')

        cy.getStore('@files').keys().should('not.be.empty')
      })
    })
  })
})
