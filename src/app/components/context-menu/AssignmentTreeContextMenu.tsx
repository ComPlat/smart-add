import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef } from 'react'

import ContextMenuItem from './ContextMenuItem'
import AddAnalysisContextMenuItem from './context-menu-items/AddAnalysisContextMenuItem'
import AddReactionContextMenuItem from './context-menu-items/AddReactionContextMenuItem'
import AddSampleContextMenuItem from './context-menu-items/AddSampleContextMenuItem'
import DeleteContextMenuItem from './context-menu-items/DeleteContextMenuItem'
import RenameContextMenuItem from './context-menu-items/RenameContextMenuItem'

interface AssignmentTreeContextMenu {
  closeContextMenu: () => void
  targetItem?: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
  x: number
  y: number
}

const AssignmentTreeContextMenu: FC<AssignmentTreeContextMenu> = ({
  closeContextMenu,
  targetItem,
  tree,
  x,
  y,
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(contextMenuRef, closeContextMenu)

  const renderContextMenu = () => {
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
    <div
      className={
        'absolute z-30 animate-fade-in rounded-lg border border-gray-300 bg-white shadow-lg'
      }
      ref={contextMenuRef}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <ContextMenuItem renderContextMenu={renderContextMenu()} />
    </div>
  )
}

export default AssignmentTreeContextMenu
