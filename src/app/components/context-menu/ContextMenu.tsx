import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef } from 'react'

import AddFolder from '../context-menu/AddFolder'
import Delete from './Delete'
import Rename from './Rename'
import classes from './popup.module.css'

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
      className={`${classes['animate-fade-in']} absolute z-30 rounded-lg border border-gray-300 bg-white shadow-lg`}
      ref={contextMenuRef}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <ul className="px-1 [&>li:hover]:bg-gray-300 [&>li]:my-1 [&>li]:cursor-pointer [&>li]:rounded [&>li]:px-2 [&>li]:py-1">
        {!targetItem ? (
          <AddFolder close={closeContextMenu} item={targetItem} tree={tree} />
        ) : (
          targetItem.isFolder && (
            <AddFolder close={closeContextMenu} item={targetItem} tree={tree} />
          )
        )}
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
