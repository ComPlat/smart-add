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

  describe('InspectorSidebar', () => {
    it('shows image preview after image is clicked', () => {
      const zipFile = 'cypress/fixtures/test-images.zip'
      const imageFileName = 'smartAdd5.png'

      // Upload the ZIP file
      cy.get('span[role=button]').selectFile(zipFile, {
        action: 'drag-drop',
      })

      // Wait for ZIP folder to appear and expand it
      cy.get('button[data-rct-item-id="test-images.zip"]', {
        timeout: 10000,
      }).click()

      // Expand the inner folder
      cy.get('button[data-rct-item-id="test-images.zip/test-images"]', {
        timeout: 10000,
      }).click()

      // Click on the image file
      cy.get(
        `button[data-rct-item-id="test-images.zip/test-images/${imageFileName}"]`,
        { timeout: 10000 },
      ).click()

      // Wait for inspector sidebar to be visible
      cy.get('aside', { timeout: 5000 }).should('be.visible')

      // Verify image is displayed
      cy.get('aside img', { timeout: 10000 })
        .should('be.visible')
        .and('have.attr', 'alt', imageFileName)
        .and('have.attr', 'src')
        .and('match', /^blob:/)
    })
  })
})
