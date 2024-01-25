import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { TreeContextMenu } from '@/types/TreeContextMenu'
import { FC, useRef } from 'react'

import ContextMenuContainer from './ContextMenuItem'
import AddAnalysisContextMenuItem from './context-menu-items/AddAnalysisContextMenuItem'
import AddReactionContextMenuItem from './context-menu-items/AddReactionContextMenuItem'
import AddSampleContextMenuItem from './context-menu-items/AddSampleContextMenuItem'
import DeleteContextMenuItem from './context-menu-items/DeleteContextMenuItem'
import RenameContextMenuItem from './context-menu-items/RenameContextMenuItem'

type ContextMenu = {
  closeContextMenu: () => void
  isAnalysesFolder?: boolean
  isStructureFolder?: boolean
  targetItem?: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const DefaultContextMenu = ({
  closeContextMenu,
  targetItem,
  tree,
}: {
  closeContextMenu: () => void
  targetItem: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}) => (
  <>
    <RenameContextMenuItem
      close={closeContextMenu}
      item={targetItem}
      tree={tree}
    />
    <DeleteContextMenuItem
      close={closeContextMenu}
      item={targetItem}
      tree={tree}
    />
  </>
)

const ClickOnAnalysisContextMenu = ({
  closeContextMenu,
  targetItem,
  tree,
}: {
  closeContextMenu: () => void
  targetItem: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}) => (
  <>
    <AddAnalysisContextMenuItem
      close={closeContextMenu}
      item={targetItem}
      tree={tree}
    />
    <span className="block h-px bg-gray-300" />
    <DefaultContextMenu
      closeContextMenu={closeContextMenu}
      targetItem={targetItem}
      tree={tree}
    />
  </>
)

const CreateStructureContextMenu = ({
  closeContextMenu,
  tree,
}: {
  closeContextMenu: () => void

  tree: Record<string, FileNode>
}) => (
  <>
    <AddSampleContextMenuItem close={closeContextMenu} tree={tree} />
    <AddReactionContextMenuItem close={closeContextMenu} tree={tree} />
  </>
)

const ContextMenu = ({
  closeContextMenu,
  isAnalysesFolder,
  isStructureFolder,
  targetItem,
  tree,
}: ContextMenu) => {
  if (!targetItem) {
    return (
      <CreateStructureContextMenu
        closeContextMenu={closeContextMenu}
        tree={tree}
      />
    )
  }

  if (isAnalysesFolder)
    return (
      <ClickOnAnalysisContextMenu
        closeContextMenu={closeContextMenu}
        targetItem={targetItem}
        tree={tree}
      />
    )

  if (!isAnalysesFolder && !isStructureFolder) {
    return (
      <DefaultContextMenu
        closeContextMenu={closeContextMenu}
        targetItem={targetItem}
        tree={tree}
      />
    )
  }

  return (
    <CreateStructureContextMenu
      closeContextMenu={closeContextMenu}
      tree={tree}
    />
  )
}

const AssignmentTreeContextMenu: FC<TreeContextMenu> = ({
  closeContextMenu,
  targetItem,
  tree,
  x,
  y,
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const isAnalysesFolder =
    targetItem?.fullPath.includes('analyses') &&
    !targetItem?.fullPath.includes('analysis')
  const isStructureFolder = targetItem?.fullPath.includes('structure')

  useOnClickOutside(contextMenuRef, closeContextMenu)

  return (
    <ContextMenuContainer contextMenuRef={contextMenuRef} x={x} y={y}>
      <ContextMenu
        closeContextMenu={closeContextMenu}
        isAnalysesFolder={isAnalysesFolder}
        isStructureFolder={isStructureFolder}
        targetItem={targetItem}
        tree={tree}
      />
    </ContextMenuContainer>
  )
}

export default AssignmentTreeContextMenu
