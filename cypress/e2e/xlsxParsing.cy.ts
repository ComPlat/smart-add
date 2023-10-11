import '@this-dot/cypress-indexeddb'

describe('XLSX Parsing', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  afterEach(() => {
    cy.clearIndexedDb('filesDatabase')
  })

  it('should upload an XLSX file', () => {
    const xlsxFile = `cypress/fixtures/file_example_XLSX_50.xlsx`

    cy.get('input[type="file"].border').selectFile(xlsxFile)
  })

  context('when the XLSX file is uploaded', () => {
    const xlsxFile = `cypress/fixtures/file_example_XLSX_50.xlsx`

    beforeEach(() => {
      cy.get('input[type="file"].border').selectFile(xlsxFile)
    })

    it('should generate output', () => {
      cy.get('ul')
    })

    it('validate the parsing result', () => {
      cy.get('ul').should('contain', 'root')
      cy.get('ul').should('contain', 'Directory')
      cy.get('ul').should('contain', 'Workbook')
      cy.get('ul').should('contain', 'Props')
    })
  })
})
