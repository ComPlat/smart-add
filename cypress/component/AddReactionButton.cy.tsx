import AddReactionButton from '@/app/components/structure-btns/AddReactionButton'
import { FileNode } from '@/helper/types'

describe('AddReactionButton Component', () => {
  const mockTree: Record<string, FileNode> = {}

  it('should render the Add Reaction button', () => {
    cy.mount(<AddReactionButton tree={mockTree} />)
    cy.get('button').contains('Add Reaction').should('be.visible')
  })

  it('should open modal when button is clicked', () => {
    cy.mount(<AddReactionButton tree={mockTree} />)
    cy.get('button').contains('Add Reaction').click()
    cy.get('.ant-modal').should('be.visible')
  })

  it('should have default values', () => {
    cy.mount(<AddReactionButton tree={mockTree} />)
    cy.get('button').contains('Add Reaction').click()
    
    cy.get('input[id="reactionName"]').should('have.value', 'Reaction')
    cy.get('input[id="sampleName-0"]').should('have.value', 'Sample')
    cy.get('select[name="sample-type"]').should('have.value', 'product')
  })

  it('should allow changing sample type', () => {
    cy.mount(<AddReactionButton tree={mockTree} />)
    cy.get('button').contains('Add Reaction').click()
    
    cy.get('select[name="sample-type"]')
      .select('reactant')
      .should('have.value', 'reactant')
  })

  it('should close modal when OK is clicked', () => {
    cy.mount(<AddReactionButton tree={mockTree} />)
    cy.get('button').contains('Add Reaction').click()
    cy.get('button').contains('OK').click()
    cy.get('.ant-modal').should('not.be.visible')
  })
})