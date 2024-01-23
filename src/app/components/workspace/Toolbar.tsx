import { FileNode } from '@/helper/types'

import AddAnalysis from '../structure-btns/AddAnalysis'
import AddReaction from '../structure-btns/AddReaction'
import AddSample from '../structure-btns/AddSample'
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
        <AddSample tree={tree} />
        <AddReaction tree={tree} />
        <AddAnalysis tree={tree} />
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
