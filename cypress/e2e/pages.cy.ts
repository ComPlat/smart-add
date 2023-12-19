import '@this-dot/cypress-indexeddb'

describe('Pages', () => {
  beforeEach(() => {
    cy.visit('/').wait(100).clearIndexedDb('filesDatabase')
    cy.visit('/').clearIndexedDb('assignmentsDatabase')
  })

  describe('UploadForm', () => {
    const fileName = 'file.json'

    beforeEach(() => {
      cy.fixture(fileName).as('testFile')
    })

    context('when uploading per drag and drop', () => {
      beforeEach(() => {
        cy.get('span[role=button]').selectFile('@testFile', {
          action: 'drag-drop',
        })
      })

      it('shows message that upload was successful', () => {
        cy.get('button').contains(fileName)

        cy.get('.ant-message-success').should(
          'contain',
          `${fileName} uploaded successfully`,
        )
      })

      it('fills IndexedDB database', () => {
        cy.openIndexedDb('filesDatabase')
          .openIndexedDb('filesDatabase')
          .createObjectStore('files')
          .as('files')

        cy.getStore('@files').keys().should('not.be.empty')
      })
    })
  })
})
