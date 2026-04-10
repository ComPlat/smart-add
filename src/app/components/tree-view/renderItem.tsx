import { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react'
import {
  TreeItem,
  TreeItemIndex,
  TreeItemRenderContext,
} from 'react-complex-tree'
import { FaPen, FaPlus, FaTrashCan } from 'react-icons/fa6'

import { FileNode } from '@/helper/types'
import { ICONS } from './fileIcons'
import { createSample, createAnalysis } from '../structure-btns/templates'
import { getUniqueFolderName } from '../structure-btns/folderUtils'
import MoleculeTooltip from './MoleculeTooltip'
import ReactionTooltip from './ReactionTooltip'
import { dragNotifications } from '@/utils/dragNotifications'

interface RenderItemParams {
  children: ReactNode
  context: TreeItemRenderContext<never>
  depth: number
  item: TreeItem<string>
  title: ReactNode
}

const Icon = (
  fileItem: TreeItem<string>,
  context: TreeItemRenderContext,
  title: ReactNode,
): ReactElement => {
  if (!fileItem.isFolder) {
    const key = typeof title === 'string' ? title.split('.').pop() : ''
    return ICONS[key as keyof typeof ICONS] || ICONS.file
  }

  const isZip = fileItem.data.endsWith('.zip')
  return context.isExpanded
    ? isZip
      ? ICONS.zipOpen
      : ICONS.folderMinus
    : isZip
    ? ICONS.zip
    : ICONS.folderPlus
}

const createRenderItem = (
  tree: Record<string, FileNode>,
  setExpandedItems?: Dispatch<SetStateAction<TreeItemIndex[]>>,
  actions?: {
    onRenameClick?: (fullPath: string, x: number, y: number) => void
    onDeleteClick?: (fullPath: string, x: number, y: number) => void
  },
) =>
  function RenderItem({
    children,
    context,
    depth,
    item,
    title,
  }: RenderItemParams) {
    const { isDraggingOver } = context
    const shouldHideTitle = typeof title === 'string' && title.endsWith('.root')

    const titleClass =
      item.isFolder && item.children?.length === 0 ? 'text-gray-400' : ''

    // Get the FileNode data to access reactionSchemeType
    const fileNode = tree[item.index]

    // Check if sample has a parent that is a reaction
    const getParentNode = (
      node: FileNode | undefined,
    ): FileNode | undefined => {
      if (!node?.uid) return undefined

      // Find parent by looking for a node that has this node as a child
      const parentEntry = Object.entries(tree).find(
        ([, parentNode]) => parentNode.children?.includes(node.index),
      )
      return parentEntry ? parentEntry[1] : undefined
    }

    const parentNode = getParentNode(fileNode)
    const isInsideReaction = parentNode?.dtype === 'reaction'

    // Get the reaction scheme type for display
    const reactionSchemeType =
      fileNode?.isFolder &&
      fileNode.dtype === 'sample' &&
      isInsideReaction &&
      fileNode.reactionSchemeType &&
      fileNode.reactionSchemeType !== 'none'
        ? fileNode.reactionSchemeType
        : null

    // Check if this is a reaction folder
    const isReactionFolder = fileNode?.isFolder && fileNode.dtype === 'reaction'
    const isSample = fileNode?.isFolder && fileNode.dtype === 'sample'
    const isAnalysesFolder = fileNode?.isFolder && fileNode.dtype === 'analyses'
    const isStructureFolder =
      fileNode?.isFolder &&
      (fileNode.metadata as any)?.container_type === 'structure'
    const isMoleculeFolder = fileNode?.isFolder && fileNode.dtype === 'molecule'

    // Show rename/delete buttons for actionable nodes (not root, not analyses, not structure, not molecule)
    const showRenameDelete =
      !shouldHideTitle &&
      !!fileNode &&
      !!actions &&
      !isAnalysesFolder &&
      !isStructureFolder &&
      !isMoleculeFolder

    const handleRenameClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      actions?.onRenameClick?.(String(item.index), e.pageX, e.pageY)
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      actions?.onDeleteClick?.(String(item.index), e.pageX, e.pageY)
    }

    const handleAddAnalysisToAnalyses = async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (fileNode) {
        const analysisName = getUniqueFolderName(
          'analysis',
          tree,
          'analysis',
          false,
          fileNode.index,
        )
        await createAnalysis(
          'analysis',
          fileNode.index,
          tree,
          fileNode.uid || '',
        )
        setExpandedItems?.((prev) =>
          prev.includes(fileNode.index) ? prev : [...prev, fileNode.index],
        )
        dragNotifications.showSuccess(
          `"${analysisName}" added to ${parentNode?.data || fileNode.data}`,
          0,
        )
      }
    }

    const handleAddSampleToReaction = async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (fileNode) {
        const baseSampleName = 'Sample'
        const uniqueSampleName = getUniqueFolderName(
          baseSampleName,
          tree,
          baseSampleName,
          false,
          fileNode.index,
        )

        await createSample(
          uniqueSampleName,
          tree,
          fileNode.index,
          fileNode.uid || undefined,
          'product',
        )
        setExpandedItems?.((prev) =>
          prev.includes(fileNode.index) ? prev : [...prev, fileNode.index],
        )
        dragNotifications.showSuccess(
          `"${uniqueSampleName}" added to ${fileNode.data}`,
          0,
        )
      }
    }

    return (
      <li
        title={String(title)}
        {...context.itemContainerWithChildrenProps}
        className="grid grid-cols-1"
      >
        <button
          {...context.itemContainerWithoutChildrenProps}
          {...context.interactiveElementProps}
          data-mykey={item.index}
          className={`flex items-center justify-between px-2 text-sm h-7
          ${context.isSelected ? 'rounded-md bg-kit-primary-mid font-bold' : ''}
          ${
            isDraggingOver ? 'rounded-md bg-blue-200' : ''
          } text-sm text-gray-800 duration-75 hover:text-kit-primary-full`}
          style={{
            marginLeft: `${depth * 25}px`,
          }}
          type="button"
        >
          <div className="flex items-center">
            <span className={`mr-2 ${titleClass}`}>
              {Icon(item, context, title)}
            </span>
            {isReactionFolder && (
              <img
                src="/reaction.svg"
                alt="reaction"
                className="w-4 h-4 mr-1"
              />
            )}
            {isSample && (
              <img src="/sample.svg" alt="sample" className="w-4 h-4 mr-1" />
            )}
            <span
              className={`truncate ${
                shouldHideTitle ? 'invisible' : ''
              } ${titleClass}`}
              data-mykey={item.index}
            >
              {shouldHideTitle ? (
                <span className="invisible">{'\u200B'}</span>
              ) : (
                <>
                  {isReactionFolder ? (
                    (() => {
                      const reactionSvgUrl = (fileNode?.metadata as any)
                        ?.reaction_svg_file
                      return (
                        <ReactionTooltip
                          reactionSvgUrl={reactionSvgUrl}
                          data-mykey={item.index}
                        >
                          <>{title}</>
                        </ReactionTooltip>
                      )
                    })()
                  ) : isSample ? (
                    (() => {
                      // Look for molecule as a child of the sample
                      let molfile: string | undefined
                      let smiles: string | undefined

                      // Check if sample has molfile directly in metadata
                      if (fileNode?.metadata) {
                        molfile = (fileNode.metadata as any)?.molfile
                        smiles = (fileNode.metadata as any)?.cano_smiles
                      }

                      // Look for a molecule child folder (children are paths)
                      if (!molfile && !smiles && fileNode?.children) {
                        const moleculeChildPath = fileNode.children.find(
                          (childPath) => {
                            const child = tree[childPath]
                            return child?.dtype === 'molecule'
                          },
                        )
                        if (moleculeChildPath) {
                          const moleculeNode = tree[moleculeChildPath]
                          molfile = (moleculeNode?.metadata as any)?.molfile
                          smiles = (moleculeNode?.metadata as any)?.cano_smiles
                        }
                      }

                      return (
                        <MoleculeTooltip
                          molfile={molfile}
                          smiles={smiles}
                          data-mykey={item.index}
                        >
                          <>
                            {title}
                            {reactionSchemeType && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-kit-primary-light text-kit-primary-full rounded">
                                {reactionSchemeType
                                  .replace(/([A-Z])/g, ' $1')
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </span>
                            )}
                          </>
                        </MoleculeTooltip>
                      )
                    })()
                  ) : (
                    <>
                      {title}
                      {reactionSchemeType && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-kit-primary-light text-kit-primary-full rounded">
                          {reactionSchemeType
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </span>
            {showRenameDelete && (
              <button
                className="px-1 py-1 ml-1 bg-amber-500 text-white hover:bg-amber-600 rounded duration-150 transition-colors shrink-0"
                onClick={handleRenameClick}
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.stopPropagation()}
                title="Rename"
                type="button"
              >
                <FaPen className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5 ml-auto shrink-0">
            {isReactionFolder && (
              <button
                className="px-1 py-1 bg-kit-primary-full text-white hover:bg-kit-primary-full/90 rounded duration-150 transition-colors text-xs font-medium"
                onClick={handleAddSampleToReaction}
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.stopPropagation()}
                title="Add sample to reaction"
                type="button"
              >
                <FaPlus className="w-2.5 h-2.5" />
              </button>
            )}
            {isAnalysesFolder && (
              <button
                className="px-1 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded duration-150 transition-colors text-xs font-medium"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleAddAnalysisToAnalyses}
                onFocus={(e) => e.stopPropagation()}
                title="Add analysis"
                type="button"
              >
                <FaPlus className="w-2.5 h-2.5" />
              </button>
            )}
            {showRenameDelete && (
              <button
                className="px-1 py-1 bg-red-500 text-white hover:bg-red-600 rounded duration-150 transition-colors"
                onClick={handleDeleteClick}
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.stopPropagation()}
                title="Delete"
                type="button"
              >
                <FaTrashCan className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </button>
        {children}
      </li>
    )
  }

export { createRenderItem }
