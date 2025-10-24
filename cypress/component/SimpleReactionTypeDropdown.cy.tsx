import SimpleReactionTypeDropdown from '@/app/components/input-components/SimpleReactionTypeDropdown'
import { ReactionSchemeType } from '@/database/db'

describe('SimpleReactionTypeDropdown Component', () => {
  it('should render with correct default value', () => {
    const defaultProps = {
      value: 'product' as ReactionSchemeType,
      onChange: cy.stub(),
    }
    cy.mount(<SimpleReactionTypeDropdown {...defaultProps} />)
    cy.get('select[name="sample-type"]').should('have.value', 'product')
  })

  it('should display all reaction scheme type options', () => {
    const defaultProps = {
      value: 'product' as ReactionSchemeType,
      onChange: cy.stub(),
    }
    cy.mount(<SimpleReactionTypeDropdown {...defaultProps} />)
    
    cy.get('select[name="sample-type"] option').then($options => {
      const values = [...$options].map(el => (el as HTMLOptionElement).value)
      expect(values).to.include.members(['startingMaterial', 'reactant', 'product', 'solvent'])
    })
  })

  it('should call onChange when selection changes', () => {
    const defaultProps = {
      value: 'product' as ReactionSchemeType,
      onChange: cy.stub().as('onChange'),
    }
    cy.mount(<SimpleReactionTypeDropdown {...defaultProps} />)
    
    cy.get('select[name="sample-type"]')
      .select('reactant')
      .then(() => {
        cy.get('@onChange').should('have.been.calledWith', 'reactant')
      })
  })
})