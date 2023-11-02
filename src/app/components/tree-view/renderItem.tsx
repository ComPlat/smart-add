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
  item: TreeItem<string>,
  context: TreeItemRenderContext,
  title: ReactNode,
): ReactElement => {
  if (item.isFolder) return context.isExpanded ? ICONS.folderOpen : ICONS.folder

  const key = typeof title === 'string' ? title.split('.').pop() : ''
  return ICONS[key as keyof typeof ICONS] || ICONS.txt
}

const renderItem = ({
  children,
  context,
  depth,
  item,
  title,
}: RenderItemParams) => {
  return (
    <li {...context.itemContainerWithChildrenProps}>
      <button
        {...context.itemContainerWithoutChildrenProps}
        {...context.interactiveElementProps}
        style={{
          display: 'flex',
          margin: '5px',
          paddingLeft: `${depth * 25}px`,
        }}
        className="items-center"
        type="button"
      >
        <span style={{ marginRight: '10px' }}>
          {Icon(item, context, title)}
        </span>
        <span>{title}</span>
      </button>
      {children}
    </li>
  )
}

export { renderItem }
