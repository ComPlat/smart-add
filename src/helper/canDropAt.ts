import { DraggingPosition, TreeItem } from 'react-complex-tree'

import { FileNode } from './types'

const canDropAt = (
  items: TreeItem[],
  target: DraggingPosition,
  treeData: Record<string, FileNode>,
) => {
  const isDroppable = (parent: FileNode) =>
    !parent.children.some(
      (child) => treeData[child].data === treeData[items[0].index].data,
    )

  switch (target.targetType) {
    case 'item':
      return isDroppable(treeData[target.targetItem])
    case 'between-items':
      return isDroppable(treeData[target.parentItem])
    default:
      return true
  }
}

export { canDropAt }
