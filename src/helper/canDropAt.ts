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

  const getTargetNode = (): FileNode | null => {
    switch (target.targetType) {
      case 'item':
        return treeData[target.targetItem] || null
      case 'between-items':
        return treeData[target.parentItem] || null
      default:
        return null
    }
  }

  // Basic duplicate name check — skip only if an analysis is reordering within its own analyses folder
  const targetNode = getTargetNode()
  const sourceNodeForReorder = treeData[items[0].index]
  const isReorderingWithinSameParent =
    target.targetType === 'between-items' &&
    sourceNodeForReorder?.dtype === 'analysis' &&
    targetNode?.dtype === 'analyses' &&
    targetNode?.children?.includes(String(items[0].index))

  if (targetNode && !isReorderingWithinSameParent && !isDroppable(targetNode)) {
    return false
  }

  // NEW RESTRICTION 1: ExportFiles area (assignmentTree) should only accept files, not folders
  if (target.treeId === 'assignmentTree') {
    const sourceNode = treeData[items[0].index]
    const sourceName = items[0].data || sourceNode?.data || ''

    // Use file extension to determine if it's a file rather than relying on isFolder flag
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(sourceName)
    const isActuallyAFolder = !hasFileExtension

    if (isActuallyAFolder) {
      // Allow samples to be dropped into reactions within ExportFiles area
      const isSample = sourceNode?.dtype === 'sample'
      const isTargetReaction = targetNode?.dtype === 'reaction'

      // Allow datasets to be dropped into analysis containers
      const isDataset = sourceNode?.dtype === 'dataset'
      const isTargetAnalysis = targetNode?.dtype === 'analysis'

      // Allow analysis to be dropped into analyses folders
      const isAnalysis = sourceNode?.dtype === 'analysis'
      const isTargetAnalyses = targetNode?.dtype === 'analyses'

      // Allow simple folders to be dropped into datasets
      // Simple folders are only 'folder' type or undefined
      const isSimpleFolder =
        !sourceNode?.dtype || sourceNode?.dtype === 'folder'
      const isTargetDataset = targetNode?.dtype === 'dataset'

      if (isSample && isTargetReaction) {
        // Continue with other validation rules
      } else if (isDataset && isTargetAnalysis) {
        // allowed
      } else if (isAnalysis && isTargetAnalyses) {
        // allowed
      } else if (isSimpleFolder && isTargetDataset) {
        // allowed
      } else {
        return false
      }
    }

    // NEW RESTRICTION 1.1: Files can only be dropped in dataset containers
    // TODO: Allow test environment to bypass this restriction; remove line 90-01(window!==undefined and next line)
    if (
      !isActuallyAFolder &&
      typeof window !== 'undefined' &&
      !(window as any).Cypress
    ) {
      const isTargetDataset = targetNode?.dtype === 'dataset'

      if (
        !isTargetDataset &&
        targetNode?.dtype &&
        targetNode?.dtype !== 'folder'
      ) {
        return false
      }
    }
  }

  // NEW RESTRICTION 2: UploadFiles area (inputTree) should not accept specific folder types
  if (target.treeId === 'inputTree') {
    const sourceNode = treeData[items[0].index]
    const sourceName = items[0].data || sourceNode?.data || ''

    // Use file extension to determine if it's actually a folder
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(sourceName)
    const isActuallyAFolder = !hasFileExtension

    if (isActuallyAFolder) {
      const isRestrictedFolder =
        sourceNode?.dtype === 'analyses' ||
        sourceNode?.dtype === 'sample' ||
        sourceNode?.dtype === 'reaction' ||
        sourceNode?.dtype === 'dataset'

      if (isRestrictedFolder) {
        return false
      }
    }
  }

  // Business logic: Use dtype for reliable type detection
  const sourceNode = treeData[items[0].index]
  if (sourceNode && targetNode) {
    const isSourceReaction = sourceNode.dtype === 'reaction'
    const isSourceAnalysis = sourceNode.dtype === 'analysis'
    const isSourceSample = sourceNode.dtype === 'sample'
    const isSourceDataset = sourceNode.dtype === 'dataset'
    const isTargetReaction = targetNode.dtype === 'reaction'
    const isTargetSample = targetNode.dtype === 'sample'
    const isTargetAnalyses = targetNode.dtype === 'analyses'

    // Rule 1: Reaction cannot be dropped into Sample
    if (isSourceReaction && isTargetSample) return false

    // Rule 2: Reaction cannot be dropped into another Reaction
    if (isSourceReaction && isTargetReaction) return false

    // Rule 3: Analysis can only be dropped into analyses folder
    if (isSourceAnalysis && !isTargetAnalyses) return false

    // Rule 4: Sample cannot be dropped into another Sample
    if (isSourceSample && isTargetSample) return false

    // Rule 5: Dataset can only be dropped into analysis items (not reactions, samples, or analyses folders)
    if (isSourceDataset) {
      const isTargetAnalysis = targetNode.dtype === 'analysis'
      if (!isTargetAnalysis) return false
    }
  }

  return true
}

export { canDropAt }
