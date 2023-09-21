import { ExtendedFile } from '@/database/db'

import { DeleteFileButton } from '../../../src/app/components/upload-form/DeleteFileButton'

describe('<DeleteFileButton />', () => {
  const files: ExtendedFile[] = []

  it('renders', () => {
    files.map((file) => {
      cy.mount(<DeleteFileButton file={file} />)
    })
  })
})
