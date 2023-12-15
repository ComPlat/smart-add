import { FileNode } from '@/helper/types'

import AddReaction from '../structure-btns/AddReaction'
import AddSample from '../structure-btns/AddSample'
import ClearButtonGroup from '../tree-view/ClearButtonGroup'
import { FileDownloader } from '../zip-download/FileDownloader'

type ToolbarProps = {
  assignmentDBLength: number
  inputDBLength: number
  tree: Record<string, FileNode>
}

const Toolbar = ({ assignmentDBLength, inputDBLength, tree }: ToolbarProps) => {
  return (
    <aside className="flex justify-between">
      <div className="flex">
        <AddSample tree={tree} />
        <AddReaction tree={tree} />
        <ClearButtonGroup
          assignmentDBLength={assignmentDBLength}
          inputDBLength={inputDBLength}
        />
      </div>
      <FileDownloader />
    </aside>
  )
}

export { Toolbar }
