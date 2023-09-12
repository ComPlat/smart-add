import localforage from 'localforage'

describe('Pages', () => {
  before(() => {
    localforage.clear()
  })

  it('visits page', () => {
    cy.visit('/')
  })

  it('uploads file per drag and drop successfully', () => {
    const path = 'cypress/fixtures'
    const fileName = 'file.json'

    cy.visit('/')

    cy.get('span[role=button]').selectFile(`${path}/${fileName}`, {
      action: 'drag-drop',
    })

    cy.get('.ant-upload-list-item-name').should('contain', fileName)
    cy.get('.ant-message-success').should(
      'contain',
      `${fileName} file uploaded successfully`,
    )
  })
})
