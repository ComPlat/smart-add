/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
import '@this-dot/cypress-indexeddb'
import 'cypress-file-upload'

describe('XLSX Upload and Parsing', () => {
  beforeEach(() => {
    // HINT: Solves some mysterious race condition about IndexedDB and Cypress
    cy.visit('/').clearIndexedDb('filesDatabase') // HINT: Solves some mysterious race condition about IndexedDB and Cypress

    // cy.wait(5_000)
  })

  it('should upload xlsx file', () => {
    const filePath = 'file_example_XLSX_50.xlsx'

    cy.fixture(filePath, 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      // .then((blob) => {
      //   const file = new File([blob], 'testPicture.png', { type: 'image/png' })
      //   Object.defineProperty(file, 'webkitRelativePath', {
      //     value: 'images/2017/01/testPicture.png',
      //   })
      // })
      .then((fileContent) => {
        // const blob = Cypress.Blob.base64StringToBlob(fileContent)
        const file = new File([fileContent], filePath, {
          type: 'image/png',
        })
        Object.defineProperty(file, 'webkitRelativePath', {
          value: `./${filePath}`,
        })

        cy.get('input[type="file"]').attachFile({
          // encoding: 'utf-8',
          file,
          filePath, // FIXME: Only fills attribute name of File object, not webkitRelativePath (which remains empty string)
          lastModified: new Date().getTime(),
        })
      })

    // HINT: Component and upload are mounting db, so this will not work before.
    cy.openIndexedDb('filesDatabase')
      .createObjectStore('files')
      .entries()
      .should(($files) => {
        expect($files).to.have.length(1)
      })
      .should(($files) => {
        expect($files[0]).haveOwnProperty('path')
      })
      .should(($files) => {
        expect($files[0].path).to.eq(filePath)
      })

    // cy.get('input[type="text"]').type('file_example_XLSX_50.xlsx')
    // cy.get('button.rounded-md').click()

    // cy.get('ul')
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
