/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import '@this-dot/cypress-indexeddb'
import 'cypress-file-upload'

describe('XLSX Upload and Parsing', () => {
  beforeEach(() => {
    cy.visit('/').clearIndexedDb('filesDatabase') // HINT: Solves some mysterious race condition about IndexedDB and Cypress

    // cy.wait(5_000)
  })

  it('should upload xlsx file', () => {
    const filePath = 'file_example_XLSX_50.xlsx'

    cy.get('span[role="button"]')
      .selectFile(
        {
          contents: `cypress/fixtures/${filePath}`,
        },
        {
          action: 'drag-drop',
          force: true,
        },
      )
      .openIndexedDb('filesDatabase')
      .createObjectStore('files')
      .entries()
      .should(($files) => {
        expect($files).to.have.length(1)
      })
      .should(($files) => {
        expect($files[0]).haveOwnProperty('path')
      })
      .should(($files) => {
        // HINT: This is not intended, but neither Cypress
        //       nor we are able to mock webkitRelativePath correctly.
        expect($files[0].path).eq('')
      })
      .then(($files) => {
        // HINT: So we just mock / fix it in IndexedDB.
        // Wasted hours: 40
        const file = $files[0]
        file.path = filePath
        cy.openIndexedDb('filesDatabase')
          .createObjectStore('files')
          .updateItem(file)
      })
      .get('input[type="text"]')
      .type(filePath)
      .get('button.rounded-md')
      .click()
      .get('ul')
  })

  // it('should upload xlsx file', () => {
  //   const fileName = 'file_example_XLSX_50.xlsx'
  //   cy.fixture('file_example_XLSX_50.xlsx', 'binary').then((fileContent) => {
  //     const file = new File([fileContent], fileName, {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     })
  //     const dataTransfer = new DataTransfer()
  //     dataTransfer.items.add(file)
  //     cy.get('input[type="file"]').then((input) => {
  //       const element = input[0]
  //       if (element) {
  //         element.files = dataTransfer.files
  //         cy.wrap(input).trigger('change', { force: true })

  //         cy.get('input[type="text"]').type('file_example_XLSX_50.xlsx')
  //         cy.get('button.rounded-md').click()

  //         cy.get('ul')
  //       } else {
  //         throw new Error('Input element not found.')
  //       }
  //     })
  //   })
  //   cy.get('ul')
  // })
})
