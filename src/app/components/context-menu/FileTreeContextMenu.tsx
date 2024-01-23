import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef } from 'react'

import AddFolder from './AddFolder'
import Delete from './Delete'
import Rename from './Rename'

interface FileTreeContextMenu {
  closeContextMenu: () => void
  targetItem?: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
  x: number
  y: number
}

const FileTreeContextMenu: FC<FileTreeContextMenu> = ({
  closeContextMenu,
  targetItem,
  tree,
  x,
  y,
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(contextMenuRef, closeContextMenu)

  const renderContextMenu = () => {
    console.log(targetItem)

    if (targetItem) {
      return (
        <>
          {targetItem.isFolder && (
            <AddFolder close={closeContextMenu} item={targetItem} tree={tree} />
          )}
          <Rename close={closeContextMenu} item={targetItem} tree={tree} />
          <span className="block h-px bg-gray-300"></span>
          <Delete close={closeContextMenu} item={targetItem} tree={tree} />
        </>
      )
    }
    return <AddFolder close={closeContextMenu} item={undefined} tree={tree} />
  }

  return (
    <div
      className={
        'absolute z-30 animate-fade-in rounded-lg border border-gray-300 bg-white shadow-lg'
      }
      ref={contextMenuRef}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <ul className="px-1 [&>li:hover]:bg-gray-300 [&>li]:my-1 [&>li]:cursor-pointer [&>li]:rounded [&>li]:px-2 [&>li]:py-1">
        {renderContextMenu()}
      </ul>
    </div>
  )
}

export default FileTreeContextMenu
