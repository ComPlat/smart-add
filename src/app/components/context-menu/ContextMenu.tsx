import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef } from 'react'

import AddFolder from '../context-menu/AddFolder'
import Delete from './Delete'
import Rename from './Rename'

interface ContextMenu {
  closeContextMenu: () => void
  targetItem: ExtendedFile | ExtendedFolder | undefined
  tree: Record<string, FileNode>
  x: number
  y: number
}

const ContextMenu: FC<ContextMenu> = ({
  closeContextMenu,
  targetItem,
  tree,
  x,
  y,
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(contextMenuRef, closeContextMenu)

  return (
    <div
      className="absolute z-30 rounded-sm border border-gray-300 bg-white shadow-lg"
      ref={contextMenuRef}
      style={{ left: `${x - 15}px`, top: `${y - 15}px` }}
    >
      <ul className="px-1 [&>li:hover]:bg-gray-300 [&>li]:my-1 [&>li]:cursor-pointer [&>li]:rounded-sm [&>li]:px-2 [&>li]:py-1">
        <AddFolder close={closeContextMenu} item={targetItem} tree={tree} />
        {targetItem && (
          <>
            <Rename close={closeContextMenu} item={targetItem} tree={tree} />
            <span className="block h-px bg-gray-300"></span>
            <Delete close={closeContextMenu} item={targetItem} tree={tree} />
          </>
        )}
      </ul>
    </div>
  )
}

export default ContextMenu
