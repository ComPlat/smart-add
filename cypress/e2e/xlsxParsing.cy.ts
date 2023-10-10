import '@this-dot/cypress-indexeddb'

describe('XLSX', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  afterEach(() => {
    cy.clearIndexedDb('filesDatabase')
  })

  describe('xlsx upload prep', () => {
    const xlsxFileName = 'file_example_XLSX_50.xlsx'

    beforeEach(() => {
      cy.fixture(xlsxFileName).as('testFile')
    })

    it('xlsx file upload', () => {
      cy.get('span[role=button]').selectFile('@testFile', {
        action: 'drag-drop',
      })
      cy.wait(10_000)
      cy.get('p').contains(xlsxFileName)

      cy.get('input.w-full').type(xlsxFileName)
      cy.get('button.rounded-md').click({ force: true }) // click doesn't work
      cy.wait(1_000)
    })
  })
})
