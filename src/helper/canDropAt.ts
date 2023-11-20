import { DraggingPosition, TreeItem } from 'react-complex-tree'

import { FileNode } from './types'

const canDropAt = (
  items: TreeItem[],
  target: DraggingPosition,
  treeData: Record<string, FileNode>,
) => {
  if (target.treeId === 'inputTree') return false

  const draggedName = treeData[items[0].index].data

  if (target.targetType === 'item' || target.targetType === 'between-items') {
    const parentItem =
      target.targetType === 'item' ? target.targetItem : target.parentItem

    for (const child of treeData[parentItem].children) {
      if (treeData[child].data === draggedName) return false
    }
  }

  return true
}

export { canDropAt }
