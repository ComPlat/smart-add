import localforage from 'localforage'

describe('Pages', () => {
  beforeEach(() => {
    cy.visit('/')
    localforage.clear()
  })

  it('uploads file per drag and drop successfully', () => {
    const path = 'cypress/fixtures'
    const fileName = 'file.json'

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
