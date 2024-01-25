import { FileNode } from '@/helper/types'

import AddReactionButton from '../structure-btns/AddReactionButton'
import AddSampleButton from '../structure-btns/AddSampleButton'
import ClearButtonGroup from '../tree-view/ClearButtonGroup'
import { FileDownloader } from '../zip-download/FileDownloader'

type ToolbarProps = {
  assignedLength: number
  inputLength: number
  tree: Record<string, FileNode>
}

const Toolbar = ({ assignedLength, inputLength, tree }: ToolbarProps) => {
  return (
    <aside className="flex justify-between p-2">
      <div className="flex gap-2">
        <AddSampleButton tree={tree} />
        <AddReactionButton tree={tree} />
        <ClearButtonGroup
          assignedLength={assignedLength}
          inputLength={inputLength}
        />
      </div>
      <FileDownloader />
    </aside>
  )
}

export { Toolbar }
