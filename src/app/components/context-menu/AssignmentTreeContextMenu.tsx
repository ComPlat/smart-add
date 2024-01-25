import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { TreeContextMenu } from '@/types/TreeContextMenu'
import { FC, useRef } from 'react'

import { default as ContextMenuContainer } from './ContextMenuItem'
import AddAnalysisContextMenuItem from './context-menu-items/AddAnalysisContextMenuItem'
import AddReactionContextMenuItem from './context-menu-items/AddReactionContextMenuItem'
import AddSampleContextMenuItem from './context-menu-items/AddSampleContextMenuItem'
import DeleteContextMenuItem from './context-menu-items/DeleteContextMenuItem'
import RenameContextMenuItem from './context-menu-items/RenameContextMenuItem'

const AssignmentTreeContextMenu: FC<TreeContextMenu> = ({
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
          <AddAnalysisContextMenuItem
            close={closeContextMenu}
            item={targetItem}
            tree={tree}
          />
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
      <>
        <AddSampleContextMenuItem close={closeContextMenu} tree={tree} />
        <AddReactionContextMenuItem close={closeContextMenu} tree={tree} />
      </>
    )
  }

  return (
    <ContextMenuContainer contextMenuRef={contextMenuRef} x={x} y={y}>
      <ContextMenu />
    </ContextMenuContainer>
  )
}

export default AssignmentTreeContextMenu
