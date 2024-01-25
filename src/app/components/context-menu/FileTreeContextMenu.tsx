import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { TreeContextMenu } from '@/types/TreeContextMenu'
import { FC, useRef } from 'react'

import ContextMenuContainer from './ContextMenuItem'
import AddFolderContextMenuItem from './context-menu-items/AddFolderContextMenuItem'
import DeleteContextMenuItem from './context-menu-items/DeleteContextMenuItem'
import RenameContextMenuItem from './context-menu-items/RenameContextMenuItem'

const FileTreeContextMenu: FC<TreeContextMenu> = ({
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
    <ContextMenuContainer contextMenuRef={contextMenuRef} x={x} y={y}>
      <ContextMenu />
    </ContextMenuContainer>
  )
}

export default FileTreeContextMenu
