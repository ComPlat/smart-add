import '@this-dot/cypress-indexeddb'

describe('Pages', () => {
  beforeEach(() => {
    cy.clearIndexedDb('filesDatabase')
    cy.visit('/')
  })

  it('uploads file per drag and drop successfully', () => {
    const path = 'cypress/fixtures'
    const fileName = 'file.json'

    cy.get('span[role=button]').selectFile(`${path}/${fileName}`, {
      action: 'drag-drop',
    })

    cy.get('p').contains(`${fileName}`)

    cy.get('.ant-message-success').should(
      'contain',
      `${fileName} uploaded successfully`,
    )

    cy.openIndexedDb('filesDatabase')
      .as('testFilesDatabase')
      .getIndexedDb('@testFilesDatabase')
      .createObjectStore('files')
      .as('files')
      .getStore('@files')
      .keys()
      .should('not.be.empty')
  })
})
