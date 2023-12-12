import { assignmentsDB, filesDB } from '@/database/db'
import { Button } from 'antd'
import React from 'react'

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
  <div className="flex">
    <Button
      className="mr-2 w-1/2"
      danger
      disabled={inputDBLength === 0}
      onClick={inputDbClearHandler}
    >
      Clear Files DB
    </Button>
    <Button
      className="mr-2 w-1/2"
      danger
      disabled={assignmentDBLength === 0}
      onClick={assignmentsDBClearHandler}
    >
      Clear Assignment DB
    </Button>
  </div>
)

export default ClearButtonGroup
