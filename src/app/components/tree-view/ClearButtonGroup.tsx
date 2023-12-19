import { assignmentsDB, filesDB } from '@/database/db'

import { Button } from '../workspace/Button'

const inputDbClearHandler = async () =>
  Promise.all([filesDB.files.clear(), filesDB.folders.clear()])

const assignmentsDBClearHandler = async () =>
  Promise.all([
    assignmentsDB.assignedFiles.clear(),
    assignmentsDB.assignedFolders.clear(),
  ])

const ClearButtonGroup = ({
  assignmentDBLength,
  inputDBLength,
}: {
  assignmentDBLength: number
  inputDBLength: number
}) => (
  <div className="flex gap-2">
    <Button
      disabled={inputDBLength === 0}
      label="Clear Files DB"
      onClick={inputDbClearHandler}
      variant="danger"
    />

    <Button
      disabled={assignmentDBLength === 0}
      label="Clear Assignment DB"
      onClick={assignmentsDBClearHandler}
      variant="danger"
    />
  </div>
)

export default ClearButtonGroup
