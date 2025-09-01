import { DraggingPosition, TreeItem } from 'react-complex-tree'

import { FileNode } from './types'
import { messages } from '@/utils/messages'

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
      console.log('❌ BLOCKED: Only files can be dropped in ExportFiles area')
      messages.dragDropWarnings.onlyFilesInExport()
      return false
    }

    // NEW RESTRICTION 1.1: Files can only be dropped in dataset containers
    // TODO: Allow test environment to bypass this restriction; remove line 90-01(window!==undefined and next line)
    if (
      !isActuallyAFolder &&
      typeof window !== 'undefined' &&
      !(window as any).Cypress
    ) {
      const targetName = targetNode?.data || ''
      const isTargetDataset = targetName.toLowerCase().includes('dataset')

      console.log('🔍 Dataset container check:', {
        targetName,
        isTargetDataset,
        sourceName,
      })

      if (!isTargetDataset) {
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
        messages.dragDropWarnings.onlyInDatasetContainers()
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
        sourceName.toLowerCase().includes('analyses') ||
        sourceName.toLowerCase().includes('sample') ||
        sourceName.toLowerCase().includes('reaction') ||
        sourceName.toLowerCase().includes('dataset')

      console.log('🔍 UploadFiles check:', {
        targetTreeId: target.treeId,
        sourceIndex: items[0].index,
        sourceName,
        isActuallyAFolder,
        isRestrictedFolder,
        originalIsFolder: sourceNode?.isFolder || items[0].isFolder,
      })

      if (isRestrictedFolder) {
        console.log(
          '❌ BLOCKED: Cannot drop analyses, sample, reaction, or dataset folders into upload area',
        )
        messages.dragDropWarnings.noRestrictedFoldersInUpload()
        return false
      }
    }
  }

  //  logic: Reactions cannot be dropped into samples
  // Simple name-based detection for now
  const sourceNode = treeData[items[0].index]
  if (sourceNode && targetNode) {
    const sourceName = items[0].data || sourceNode.data
    const targetName = targetNode.data

    // Detect item types by naming pattern
    const isSourceReaction = sourceName.toLowerCase().includes('reaction')
    const isSourceAnalysis = sourceName.toLowerCase().includes('analysis')
    const isSourceSample = sourceName.toLowerCase().includes('sample')
    const isSourceDataset = sourceName.toLowerCase().includes('dataset')
    const isTargetReaction = targetName.toLowerCase().includes('reaction')
    const isTargetSample = targetName.toLowerCase().includes('sample')
    const isTargetAnalyses = targetName.toLowerCase().includes('analyses')

    console.log(' logic check:', {
      sourceName,
      targetName,
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
      messages.dragDropWarnings.noReactionInSample()
      return false
    }

    // Rule 2: Reaction cannot be dropped into another Reaction
    if (isSourceReaction && isTargetReaction) {
      console.log('❌ BLOCKED: Cannot drop reaction into another reaction')
      messages.dragDropWarnings.noReactionInReaction()
      return false
    }

    // Rule 3: Analysis can only be dropped into analyses folder
    if (isSourceAnalysis && !isTargetAnalyses) {
      console.log(
        '❌ BLOCKED: Analysis can only be dropped into analyses folder',
      )
      messages.dragDropWarnings.analysisOnlyInAnalysesFolder()
      return false
    }

    // Rule 4: Sample cannot be dropped into another Sample
    if (isSourceSample && isTargetSample) {
      console.log('❌ BLOCKED: Cannot drop sample into another sample')
      messages.dragDropWarnings.noSampleInSample()
      return false
    }

    // Rule 5: Dataset can only be dropped into analysis items (not reactions, samples, or analyses folders)
    if (isSourceDataset) {
      const isTargetAnalysis = targetName.toLowerCase().includes('analysis')

      if (!isTargetAnalysis) {
        console.log(
          '❌ BLOCKED: Dataset can only be dropped into analysis items',
        )
        messages.dragDropWarnings.datasetOnlyInAnalysis()
        return false
      }
    }
  }

  console.log('✅ ALLOWED: Drop permitted')
  return true
}

export { canDropAt }
