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

  return (
    <li
      title={String(title)}
      {...context.itemContainerWithChildrenProps}
      className="grid grid-cols-1"
    >
      <button
        {...context.itemContainerWithoutChildrenProps}
        {...context.interactiveElementProps}
        className={`flex items-center text-sm focus:outline-none
          ${context.isSelected ? 'my-1 rounded-md bg-kit-primary-mid py-1' : ''}
          ${
            isDraggingOver ? 'rounded-md bg-blue-200' : ''
          } text-sm text-gray-800 duration-100 hover:text-kit-primary-full`}
        style={{
          marginLeft: `${depth * 25}px`,
        }}
        type="button"
      >
        <span className="mx-2">{Icon(item, context, title)}</span>
        <span className={`truncate ${shouldHideTitle ? 'invisible' : ''}`}>
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
