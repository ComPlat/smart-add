import { FileNode } from '@/helper/types'
import { Dispatch, SetStateAction } from 'react'
import { TreeItemIndex } from 'react-complex-tree'

import AddReactionButton from '../structure-btns/AddReactionButton'
import AddSampleButton from '../structure-btns/AddSampleButton'
import ClearButtonGroup from '../tree-view/ClearButtonGroup'
import { FileDownloader } from '../zip-download/FileDownloader'
import ImportStructureButton from '../structure-btns/ImportStructureButton'

type ToolbarProps = {
  assignedLength: number
  inputLength: number
  tree: Record<string, FileNode>
  setFocusedItem: Dispatch<SetStateAction<TreeItemIndex | undefined>>
}

const Toolbar = ({
  assignedLength,
  inputLength,
  tree,
  setFocusedItem,
}: ToolbarProps) => {
  return (
    <aside className="flex justify-between p-2">
      <div className="flex gap-2">
        <ClearButtonGroup
          assignedLength={assignedLength}
          inputLength={inputLength}
          setFocusedItem={setFocusedItem}
        />
        <ImportStructureButton />
      </div>
      <div className="flex gap-2">
        <FileDownloader />
        <AddSampleButton tree={tree} />
        <AddReactionButton tree={tree} />
      </div>
    </aside>
  )
}

export { Toolbar }
