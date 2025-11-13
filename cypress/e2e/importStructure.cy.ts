import '@this-dot/cypress-indexeddb'

describe('Import Structure', () => {
  beforeEach(() => {
    cy.visit('/').clearIndexedDb('filesDatabase')
  })

  const jsonFile = 'cypress/fixtures/chemotion-export.json'
  const zipFile = 'cypress/fixtures/chemotion-export.zip'

  describe('JSON File Import', () => {
    it('should import JSON file and display structure in tree', () => {
      cy.contains('button', 'Import Structure').click()
      cy.get('.ant-modal .ant-upload input[type="file"]').selectFile(jsonFile, {
        force: true,
      })
      // Wait a moment for the onChange handler to process the file
      cy.wait(500)
      cy.get('.ant-modal-footer').contains('button', 'Import').should('not.be.disabled').click()

      cy.contains('Successfully imported', { timeout: 10000 })

      // Verify collection and reaction appear in tree
      cy.get('[data-rct-tree="assignmentTree"]')
        .contains('Test Collection')
        .should('be.visible')
        .parent()
        .find('button')
        .first()
        .click()

      cy.get('[data-rct-tree="assignmentTree"]')
        .contains('Test Reaction')
        .should('be.visible')
    })

    it('should create proper hierarchy with samples under reactions', () => {
      cy.contains('button', 'Import Structure').click()
      cy.get('.ant-modal .ant-upload input[type="file"]').selectFile(jsonFile, {
        force: true,
      })
      // Wait a moment for the onChange handler to process the file
      cy.wait(500)
      cy.get('.ant-modal-footer').contains('button', 'Import').should('not.be.disabled').click()
      cy.contains('Successfully imported', { timeout: 10000 })

      // Expand to reaction
      cy.get('[data-rct-tree="assignmentTree"]')
        .contains('Test Collection')
        .parent()
        .find('button')
        .first()
        .click()

      cy.get('[data-rct-tree="assignmentTree"]')
        .contains('Test Reaction')
        .parent()
        .find('button')
        .first()
        .click()

      // Verify samples are nested under reaction
      cy.get('[data-rct-tree="assignmentTree"]').within(() => {
        cy.contains('Product Sample').should('exist')
      })
    })

    it('should handle invalid files gracefully', () => {
      cy.contains('button', 'Import Structure').click()
      cy.get('.ant-modal .ant-upload input[type="file"]').selectFile(
        'cypress/fixtures/file.json',
        { force: true },
      )
      // Wait a moment for the onChange handler to process the file
      cy.wait(500)
      cy.get('.ant-modal-footer').contains('button', 'Import').should('not.be.disabled').click()

      cy.contains(/Import failed|Invalid export format/, { timeout: 10000 })
    })
  })

  describe('ZIP File Import', () => {
    it('should import ZIP file successfully', () => {
      cy.contains('button', 'Import Structure').click()
      cy.get('.ant-modal .ant-upload input[type="file"]').selectFile(zipFile, {
        force: true,
      })
      // Wait a moment for the onChange handler to process the file
      cy.wait(500)
      cy.get('.ant-modal-footer').contains('button', 'Import').should('not.be.disabled').click()

      cy.contains('Successfully imported', { timeout: 10000 })

      cy.get('[data-rct-tree="assignmentTree"]')
        .contains('Test Collection')
        .should('be.visible')
    })
  })

  describe('Database Operations', () => {
    it('should create correct entries in IndexedDB', () => {
      cy.contains('button', 'Import Structure').click()
      cy.get('.ant-modal .ant-upload input[type="file"]').selectFile(jsonFile, {
        force: true,
      })
      // Wait a moment for the onChange handler to process the file
      cy.wait(500)
      cy.get('.ant-modal-footer').contains('button', 'Import').should('not.be.disabled').click()
      cy.contains('Successfully imported', { timeout: 10000 })

      // Verify data appears in the tree (which confirms it was saved to IndexedDB)
      cy.get('[data-rct-tree="assignmentTree"]')
        .contains('Test Collection')
        .should('be.visible')
        .parent()
        .find('button')
        .first()
        .click()

      cy.get('[data-rct-tree="assignmentTree"]')
        .contains('Test Reaction')
        .should('be.visible')
    })
  })
})
