import Dexie from 'dexie'

describe('Pages', () => {
  beforeEach(() => {
    Dexie.delete('filesDatabase')
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
  })
})
