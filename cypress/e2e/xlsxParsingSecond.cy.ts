/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import '@this-dot/cypress-indexeddb'
import 'cypress-file-upload'

describe('XLSX Upload and Parsing', () => {
  beforeEach(() => {
    cy.visit('/')

    cy.wait(5_000)
  })

  afterEach(() => {
    // cy.clearIndexedDb('filesDatabase')
  })

  it('should upload xlsx file', () => {
    cy.fixture('file_example_XLSX_50.xlsx', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          filePath: 'file_example_XLSX_50.xlsx',
        })
      })

    cy.get('input[type="text"]').type('file_example_XLSX_50.xlsx')
    cy.get('button.rounded-md').click()

    cy.get('ul')
  })

  it('should upload xlsx file', () => {
    const fileName = 'file_example_XLSX_50.xlsx'
    cy.fixture('file_example_XLSX_50.xlsx', 'binary').then((fileContent) => {
      const file = new File([fileContent], fileName, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      cy.get('input[type="file"]').then((input) => {
        const element = input[0]
        if (element) {
          element.files = dataTransfer.files
          cy.wrap(input).trigger('change', { force: true })

          cy.get('input[type="text"]').type('file_example_XLSX_50.xlsx')
          cy.get('button.rounded-md').click()

          cy.get('ul')
        } else {
          throw new Error('Input element not found.')
        }
      })
    })
    cy.get('ul')
  })
})
