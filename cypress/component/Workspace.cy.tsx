import Workspace from '@/app/components/Workspace'
import { TreeItemIndex } from 'react-complex-tree'

describe('<UploadForm />', () => {
  it('renders', () => {
    const mockFocusedItem = {} as TreeItemIndex &
      (TreeItemIndex | TreeItemIndex[])
    const mockSetFocusedItem = () => {}

    cy.mount(
      <Workspace
        focusedItem={mockFocusedItem}
        setFocusedItem={mockSetFocusedItem}
      />,
    )
  })
})
