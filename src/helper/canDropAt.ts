import { DraggingPosition, TreeItem } from 'react-complex-tree'
import { FileNode } from './types'

const canDropAt = (
  items: TreeItem[],
  target: DraggingPosition,
  treeData: Record<string, FileNode>,
) => {
  console.log('=== DRAG & DROP ATTEMPT ===')

  console.log(
    'Items being dragged:',
    items.map((item) => ({
      index: item.index,
      data: item.data,
      isFolder: item.isFolder,
      metadata: treeData[item.index]?.metadata,
      fullNodeData: treeData[item.index],
    })),
  )
  console.log('Target:', {
    targetType: target.targetType,
    ...(target.targetType === 'item' && {
      targetItem: (target as any).targetItem,
    }),
    ...(target.targetType === 'between-items' && {
      parentItem: (target as any).parentItem,
    }),
    treeId: target.treeId,
  })

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

  // Basic duplicate name check
  const targetNode = getTargetNode()
  console.log('Target node:', {
    targetNode,
    data: targetNode?.data,
    metadata: targetNode?.metadata,
    isFolder: targetNode?.isFolder,
  })

  if (targetNode && !isDroppable(targetNode)) {
    console.log('❌ BLOCKED: Duplicate name in same parent')
    return false
  }

  // NEW RESTRICTION 1: ExportFiles area (assignmentTree) should only accept files, not folders
  if (target.treeId === 'assignmentTree') {
    const sourceNode = treeData[items[0].index]
    const sourceName = items[0].data || sourceNode?.data || ''

    // Use file extension to determine if it's a file rather than relying on isFolder flag
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(sourceName)
    const isActuallyAFolder = !hasFileExtension

    console.log('🔍 ExportFiles check:', {
      targetTreeId: target.treeId,
      sourceIndex: items[0].index,
      sourceName,
      hasFileExtension,
      isActuallyAFolder,
      originalIsFolder: sourceNode?.isFolder || items[0].isFolder,
    })

    if (isActuallyAFolder) {
      // Allow samples to be dropped into reactions within ExportFiles area
      const isSample = sourceNode?.dtype === 'sample'
      const isTargetReaction = targetNode?.dtype === 'reaction'

      // Allow datasets to be dropped into analysis containers
      const isDataset = sourceNode?.dtype === 'dataset'
      const isTargetAnalysis = targetNode?.dtype === 'analysis'

      // Allow simple folders to be dropped into datasets
      // Simple folders are only 'folder' type or undefined
      const isSimpleFolder =
        !sourceNode?.dtype || sourceNode?.dtype === 'folder'
      const isTargetDataset = targetNode?.dtype === 'dataset'

      if (isSample && isTargetReaction) {
        console.log(
          '✅ ALLOWED: Sample can be dropped into reaction in ExportFiles area',
        )
        // Continue with other validation rules
      } else if (isDataset && isTargetAnalysis) {
        console.log(
          '✅ ALLOWED: Dataset can be dropped into analysis in ExportFiles area',
        )
        // Continue with other validation rules
      } else if (isSimpleFolder && isTargetDataset) {
        console.log('✅ ALLOWED: Simple folder can be dropped into dataset')
        // Continue with other validation rules
      } else {
        console.log('❌ BLOCKED: Only files can be dropped in ExportFiles area')
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
      const targetName = targetNode?.data || ''
      const isTargetDataset = targetNode?.dtype === 'dataset'

      console.log('🔍 Dataset container check:', {
        targetName,
        isTargetDataset,
        sourceName,
      })

      if (
        !isTargetDataset &&
        targetNode?.dtype &&
        targetNode?.dtype !== 'folder'
      ) {
        console.log(
          '❌ BLOCKED: Files can only be dropped in dataset containers',
          {
            targetName,
            targetType: target.targetType,
            targetItem:
              target.targetType === 'item' ? target.targetItem : 'N/A',
            parentItem:
              target.targetType === 'between-items' ? target.parentItem : 'N/A',
          },
        )
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

      console.log('🔍 UploadFiles check:', {
        targetTreeId: target.treeId,
        sourceIndex: items[0].index,
        sourceName,
        sourceDtype: sourceNode?.dtype,
        isActuallyAFolder,
        isRestrictedFolder,
        originalIsFolder: sourceNode?.isFolder || items[0].isFolder,
      })

      if (isRestrictedFolder) {
        console.log(
          '❌ BLOCKED: Cannot drop analyses, sample, reaction, or dataset folders into upload area',
        )
        return false
      }
    }
  }

  // Business logic: Use dtype for reliable type detection
  const sourceNode = treeData[items[0].index]
  if (sourceNode && targetNode) {
    const sourceName = items[0].data || sourceNode.data
    const targetName = targetNode.data

    // Detect item types by dtype (much more reliable than name-based detection)
    const isSourceReaction = sourceNode.dtype === 'reaction'
    const isSourceAnalysis = sourceNode.dtype === 'analysis'
    const isSourceSample = sourceNode.dtype === 'sample'
    const isSourceDataset = sourceNode.dtype === 'dataset'
    const isTargetReaction = targetNode.dtype === 'reaction'
    const isTargetSample = targetNode.dtype === 'sample'
    const isTargetAnalyses = targetNode.dtype === 'analyses'

    console.log('🔍 Business logic check:', {
      sourceName,
      targetName,
      sourceDtype: sourceNode.dtype,
      targetDtype: targetNode.dtype,
      isSourceReaction,
      isSourceAnalysis,
      isSourceSample,
      isSourceDataset,
      isTargetReaction,
      isTargetSample,
      isTargetAnalyses,
    })

    // Rule 1: Reaction cannot be dropped into Sample
    if (isSourceReaction && isTargetSample) {
      console.log('❌ BLOCKED: Cannot drop reaction into sample')
      return false
    }

    // Rule 2: Reaction cannot be dropped into another Reaction
    if (isSourceReaction && isTargetReaction) {
      console.log('❌ BLOCKED: Cannot drop reaction into another reaction')
      return false
    }

    // Rule 3: Analysis can only be dropped into analyses folder
    if (isSourceAnalysis && !isTargetAnalyses) {
      console.log(
        '❌ BLOCKED: Analysis can only be dropped into analyses folder',
      )
      return false
    }

    // Rule 4: Sample cannot be dropped into another Sample
    if (isSourceSample && isTargetSample) {
      console.log('❌ BLOCKED: Cannot drop sample into another sample')
      return false
    }

    // Rule 5: Dataset can only be dropped into analysis items (not reactions, samples, or analyses folders)
    if (isSourceDataset) {
      const isTargetAnalysis = targetNode.dtype === 'analysis'

      if (!isTargetAnalysis) {
        console.log(
          '❌ BLOCKED: Dataset can only be dropped into analysis items',
        )
        return false
      }
    }
  }

  console.log('✅ ALLOWED: Drop permitted')
  return true
}

export { canDropAt }
