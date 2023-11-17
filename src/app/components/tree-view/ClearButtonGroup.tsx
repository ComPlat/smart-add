import { assignmentsDB, filesDB } from '@/database/db'
import { Button } from 'antd'
import React from 'react'

const ClearButtonGroup = ({
  assignedFilesLength,
  filesLength,
}: {
  assignedFilesLength: number
  filesLength: number
}) => (
  <div className="flex">
    <Button
      className="mr-2 w-1/2"
      danger
      disabled={filesLength === 0}
      onClick={() => filesDB.files.clear()}
    >
      Clear Files DB
    </Button>
    <Button
      className="mr-2 w-1/2"
      danger
      disabled={assignedFilesLength === 0}
      onClick={() => assignmentsDB.assignedFiles.clear()}
    >
      Clear Assignment DB
    </Button>
  </div>
)

export default ClearButtonGroup
