import '@this-dot/cypress-indexeddb'
import 'cypress-file-upload'

describe('XLSX Upload and Parsing', () => {
  beforeEach(() => {
    cy.visit('/').wait(3000).clearIndexedDb('filesDatabase') // HINT: Solves some mysterious race condition about IndexedDB and Cypress
  })

  // HINT: Will be activated again when XLSX parsing is
  //       working on opening a spreadsheet file
  xit('should upload xlsx file', () => {
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
        expect($files[0]).haveOwnProperty('fullPath')
      })
      .should(($files) => {
        // HINT: This is not intended, but neither Cypress
        //       nor we are able to mock webkitRelativePath correctly.
        expect($files[0].fullPath).eq('')
      })
      .then(($files) => {
        // HINT: So we just mock / fix it in IndexedDB.
        //       Wasted hours: 40
        const file = $files[0]
        file.fullPath = filePath
        cy.openIndexedDb('filesDatabase')
          .createObjectStore('files')
          .updateItem(file)
      })
      .get('input[type="text"]')
      .type(filePath)
      .get('button.rounded-md')
      .click()
      .get('ul > li')
      .find('li:first > label > span')
      .should('contain', 'Directory')
      .get('ul > li')
      .find('li:first > span > span')
      .should('contain', '25 keys')
      .get('ul > li')
      .find('li:last')
      .should('contain', 'bookType')
      .get('ul > li')
      .find('li:last > span')
      .should('contain', '"xlsx"')
  })
})
