import { ReactElement, ReactNode } from 'react'
import { TreeItem, TreeItemRenderContext } from 'react-complex-tree'

import { ICONS } from './fileIcons'

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
      : ICONS.folderOpen
    : isZip
    ? ICONS.zip
    : ICONS.folder
}

const renderItem = ({
  children,
  context,
  depth,
  item,
  title,
}: RenderItemParams) => {
  const { isDraggingOver } = context
  const shouldHideTitle = typeof title === 'string' && title.endsWith('.root')

  const titleClass =
    item.isFolder && item.children?.length === 0 ? 'text-gray-400' : ''

  return (
    <li
      title={String(title)}
      {...context.itemContainerWithChildrenProps}
      className="grid grid-cols-1"
    >
      <button
        {...context.itemContainerWithoutChildrenProps}
        {...context.interactiveElementProps}
        className={`flex items-center px-2 text-sm
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
        }}
        type="button"
      >
        <span className={`mr-2 ${titleClass}`}>
          {Icon(item, context, title)}
        </span>
        <span
          className={`truncate ${
            shouldHideTitle ? 'invisible' : ''
          } ${titleClass}`}
        >
          {shouldHideTitle ? (
            <span className="invisible">{'\u200B'}</span>
          ) : (
            title
          )}
        </span>
      </button>
      {children}
    </li>
  )
}

export { renderItem }
