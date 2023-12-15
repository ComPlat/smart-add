import { FileNode } from '@/helper/types'

import AddReaction from '../structure-btns/AddReaction'
import AddSample from '../structure-btns/AddSample'
import { FileDownloader } from '../zip-download/FileDownloader'

type ToolbarProps = {
  tree: Record<string, FileNode>
}

const Toolbar = ({ tree }: ToolbarProps) => {
  return (
    <div className="flex justify-between">
      <div className="flex">
        <AddSample tree={tree} />
        <AddReaction tree={tree} />
      </div>
      <FileDownloader />
    </div>
  )
}

export { Toolbar }
