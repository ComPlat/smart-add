import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { TreeContextMenu } from '@/types/TreeContextMenu'
import { FC, useRef } from 'react'

import ContextMenuContainer from './ContextMenuItem'
import DefaultContextMenu from './DefaultContextMenu'
import AddAnalysisContextMenuItem from './context-menu-items/AddAnalysisContextMenuItem'
import AddReactionContextMenuItem from './context-menu-items/AddReactionContextMenuItem'
import AddSampleContextMenuItem from './context-menu-items/AddSampleContextMenuItem'

type ContextMenu = {
  closeContextMenu: () => void
  isAnalysesFolder?: boolean
  isStructureFolder?: boolean
  targetItem?: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

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

const ContextMenu = ({ closeContextMenu, targetItem, tree }: ContextMenu) => {
  const isAnalysesFolder =
    targetItem?.fullPath.includes('analyses') &&
    !targetItem?.fullPath.includes('analysis')
  const isStructureFolder = targetItem?.fullPath.includes('structure')

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

export default AssignmentTreeContextMenu
