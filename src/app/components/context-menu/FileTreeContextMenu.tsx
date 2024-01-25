import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { TreeContextMenu } from '@/types/TreeContextMenu'
import { FC, useRef } from 'react'

import ContextMenuContainer from './ContextMenuItem'
import AddFolderContextMenuItem from './context-menu-items/AddFolderContextMenuItem'
import DeleteContextMenuItem from './context-menu-items/DeleteContextMenuItem'
import RenameContextMenuItem from './context-menu-items/RenameContextMenuItem'

type ContextMenu = {
  closeContextMenu: () => void
  targetItem?: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const ContextMenu = ({ closeContextMenu, targetItem, tree }: ContextMenu) => {
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
        <span className="block h-px bg-gray-300" />
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

const FileTreeContextMenu: FC<TreeContextMenu> = ({
  closeContextMenu,
  targetItem,
  tree,
  x,
  y,
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(contextMenuRef, closeContextMenu)

  return (
    <ContextMenuContainer contextMenuRef={contextMenuRef} x={x} y={y}>
      <ContextMenu
        closeContextMenu={closeContextMenu}
        targetItem={targetItem}
        tree={tree}
      />
    </ContextMenuContainer>
  )
}

export default FileTreeContextMenu
