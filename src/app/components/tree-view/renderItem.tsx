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
  const isSelected = context.isSelected
  const isDraggedOver = context.isDraggingOver

  const selectedClassesSelected = isSelected && 'text-blue-600'
  const selectedClassesDragged = isDraggedOver && 'text-green-500'

  return (
    <li {...context.itemContainerWithChildrenProps}>
      <button
        {...context.itemContainerWithoutChildrenProps}
        {...context.interactiveElementProps}
        style={{
          display: 'flex',
          maxWidth: '95%',
          paddingLeft: `${depth * 25}px`,
        }}
        className={`items-center ${selectedClassesSelected}`}
        type="button"
      >
        <span
          className={`${selectedClassesDragged}`}
          style={{ marginRight: '10px' }}
        >
          {Icon(item, context, title)}
        </span>
        <span className="truncate">{title}</span>
      </button>
      {children}
    </li>
  )
}

export { renderItem }
