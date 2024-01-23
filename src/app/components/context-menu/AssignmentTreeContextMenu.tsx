import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef } from 'react'

import AddAnalysis from './AddAnalysis'
import ContextMenuItem from './ContextMenuItem'
import Delete from './Delete'
import Rename from './Rename'

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
    // if (targetItem) {
    //   return (
    //     <>
    //       {targetItem.isFolder && (
    //         <AddFolder close={closeContextMenu} item={targetItem} tree={tree} />
    //       )}
    //       <Rename close={closeContextMenu} item={targetItem} tree={tree} />
    //       <span className="block h-px bg-gray-300"></span>
    //       <Delete close={closeContextMenu} item={targetItem} tree={tree} />
    //     </>
    //   )
    // }

    // return <p>Hello</p>

    console.log(targetItem)

    if (targetItem) {
      return (
        <>
          <AddAnalysis close={closeContextMenu} item={targetItem} tree={tree} />
          <Rename close={closeContextMenu} item={targetItem} tree={tree} />
          <span className="block h-px bg-gray-300"></span>
          <Delete close={closeContextMenu} item={targetItem} tree={tree} />
        </>
      )
    }

    return <p>Assignment tree context menu</p>
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
