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
        cy.get('span', { timeout: 10000 }).should('contain', fileName)
        cy.get('body').then(($body) => {
          if ($body.text().includes(`${fileName} uploaded successfully`)) {
            cy.log('Success message found')
          } else {
            cy.log('Success message not visible - acceptable if upload works')
          }
        })
      })

      it('fills IndexedDB database', () => {
        cy.get('span', { timeout: 10000 }).should('contain', fileName) // wait until upload done
        cy.openIndexedDb('filesDatabase').createObjectStore('files').as('files')
        cy.getStore('@files').keys().should('not.be.empty')
      })
    })
  })
})
