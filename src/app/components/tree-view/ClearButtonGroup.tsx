import { filesDB } from '@/database/db'
import { message } from 'antd'
import { Dispatch, SetStateAction } from 'react'
import { TreeItemIndex } from 'react-complex-tree'

import { Button } from '../workspace/Button'

const clearHandler = async (
  treeId: string,
  setFocusedItem?: Dispatch<SetStateAction<TreeItemIndex | undefined>>,
) => {
  try {
    await Promise.all([
      filesDB.files.where('treeId').equals(treeId).delete(),
      filesDB.folders.where('treeId').equals(treeId).delete(),
    ])

    // Close inspector when clearing assignment tree (since items are deleted)
    if (treeId === 'assignmentTreeRoot' && setFocusedItem) {
      setFocusedItem(undefined)
    }
  } catch (error) {
    console.error(`Error clearing ${treeId}:`, error)
    message.warning(`Error clearing ${treeId}.`)
  }
}

const ClearButtonGroup = ({
  assignedLength,
  inputLength,
  setFocusedItem,
}: {
  assignedLength: number
  inputLength: number
  setFocusedItem: Dispatch<SetStateAction<TreeItemIndex | undefined>>
}) => (
  <div className="flex gap-2">
    <Button
      disabled={inputLength === 0}
      label="Clear Input Tree"
      onClick={() => clearHandler('inputTreeRoot', setFocusedItem)}
      variant="danger"
    />
    <Button
      disabled={assignedLength === 0}
      label="Clear Assignment Tree"
      onClick={() => clearHandler('assignmentTreeRoot', setFocusedItem)}
      variant="danger"
    />
  </div>
)

export default ClearButtonGroup
