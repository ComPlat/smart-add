import { ReactNode } from 'react'
import { TreeItem, TreeItemRenderContext } from 'react-complex-tree'

import { ICONS } from './fileIcons'

interface RenderItemParams {
  children: ReactNode
  context: TreeItemRenderContext<never>
  depth: number
  item: TreeItem<string>
  title: ReactNode
}

const renderItem = ({
  children,
  context,
  depth,
  item,
  title,
}: RenderItemParams) => {
  let icon
  if (item.isFolder) {
    icon = context.isExpanded ? ICONS.folderOpen : ICONS.folder
  } else {
    if (typeof title === 'string') {
      const fileExtension = title.split('.').pop()
      if (fileExtension) {
        icon = ICONS[fileExtension as keyof typeof ICONS] || ICONS.txt
      } else {
        icon = ICONS.txt
      }
    }
  }

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
        <span style={{ marginRight: '10px' }}>{icon}</span>
        <span>{title}</span>
      </button>
      {children}
    </li>
  )
}

export { renderItem }
