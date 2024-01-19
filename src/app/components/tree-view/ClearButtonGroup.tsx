import { filesDB } from '@/database/db'

import { Button } from '../workspace/Button'

const inputDbClearHandler = async () =>
  Promise.all([filesDB.files.clear(), filesDB.folders.clear()])

const ClearButtonGroup = ({ inputDBLength }: { inputDBLength: number }) => (
  <div className="flex gap-2">
    <Button
      disabled={inputDBLength === 0}
      label="Clear Files DB"
      onClick={inputDbClearHandler}
      variant="danger"
    />
  </div>
)

export default ClearButtonGroup
