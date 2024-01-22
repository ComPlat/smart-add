import { filesDB } from '@/database/db'
import { message } from 'antd'

import { Button } from '../workspace/Button'

const clearHandler = async (treeId: string) => {
  try {
    await Promise.all([
      filesDB.files.where('treeId').equals(treeId).delete(),
      filesDB.folders.where('treeId').equals(treeId).delete(),
    ])
  } catch (error) {
    console.error(`Error clearing ${treeId}:`, error)
    message.warning(`Error clearing ${treeId}.`)
  }
}

const ClearButtonGroup = ({
  assignedLength,
  inputLength,
}: {
  assignedLength: number
  inputLength: number
}) => (
  <div className="flex gap-2">
    <Button
      disabled={inputLength === 0}
      label="Clear Input Tree"
      onClick={() => clearHandler('inputTreeRoot')}
      variant="danger"
    />
    <Button
      disabled={assignedLength === 0}
      label="Clear Assignment Tree"
      onClick={() => clearHandler('assignmentTreeRoot')}
      variant="danger"
    />
  </div>
)

export default ClearButtonGroup
