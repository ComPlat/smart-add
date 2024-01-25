import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef } from 'react'

import ContextMenuItem from './ContextMenuItem'
import AddFolderContextMenuItem from './context-menu-items/AddFolderContextMenuItem'
import DeleteContextMenuItem from './context-menu-items/DeleteContextMenuItem'
import RenameContextMenuItem from './context-menu-items/RenameContextMenuItem'

type FileTreeContextMenu = {
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

  const ContextMenu = () => {
    if (targetItem) {
      return (
        <>
          {targetItem.isFolder && (
            <AddFolderContextMenuItem
              close={closeContextMenu}
              item={targetItem}
              tree={tree}
            />
          )}
          <RenameContextMenuItem
            close={closeContextMenu}
            item={targetItem}
            tree={tree}
          />
          <span className="block h-px bg-gray-300"></span>
          <DeleteContextMenuItem
            close={closeContextMenu}
            item={targetItem}
            tree={tree}
          />
        </>
      )
    }
    return (
      <AddFolderContextMenuItem
        close={closeContextMenu}
        item={undefined}
        tree={tree}
      />
    )
  }

  return (
    <div
      className={
        'absolute z-30 animate-fade-in rounded-lg border border-gray-300 bg-white shadow-lg'
      }
      ref={contextMenuRef}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <ContextMenuItem renderContextMenu={<ContextMenu />} />
    </div>
  )
}

export default FileTreeContextMenu
