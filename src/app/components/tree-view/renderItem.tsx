import { ReactElement, ReactNode } from 'react'
import { TreeItem, TreeItemRenderContext } from 'react-complex-tree'
import { FaPlus } from 'react-icons/fa6'

import { FileNode } from '@/helper/types'
import { ICONS } from './fileIcons'
import { createSample } from '../structure-btns/templates'
import { getUniqueFolderName } from '../structure-btns/folderUtils'

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

const createRenderItem = (tree: Record<string, FileNode>) =>
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
          className={`flex items-center justify-between px-2 text-sm
          ${
            context.isSelected
              ? 'my-1 rounded-md bg-kit-primary-mid font-bold'
              : ''
          }
          ${
            isDraggingOver ? 'rounded-md bg-blue-200' : ''
          } text-sm text-gray-800 duration-75 hover:text-kit-primary-full`}
          style={{
            marginLeft: `${depth * 25}px`,
            marginBottom: '2px',
          }}
          type="button"
        >
          <div className="flex items-center">
            <span className={`mr-2 ${titleClass}`}>
              {Icon(item, context, title)}
            </span>
            <span
              className={`truncate ${
                shouldHideTitle ? 'invisible' : ''
              } ${titleClass}`}
            />
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
            </span>
          </div>

          {isReactionFolder && (
            <button
              className="px-1 py-1 mt-1 mb-1 bg-kit-primary-full text-white hover:bg-kit-primary-full/90 rounded duration-150 transition-colors text-xs font-medium"
              onClick={handleAddSampleToReaction}
              title="Add sample to reaction"
              type="button"
            >
              <FaPlus className="w-3 h-3" />
            </button>
          )}
        </button>
        {children}
      </li>
    )
  }

export { createRenderItem }
