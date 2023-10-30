'use client'

import { ICONS } from '@/app/components/tree-view/fileIcons'
import { filesDB } from '@/database/db'
import { constructTree } from '@/helper/constructTree'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'

const TreeView = () => {
  const files = useLiveQuery(() => filesDB.files.toArray(), [])

  if (!files) {
    return <div>Loading...</div>
  }

  const fileTree = constructTree(files)

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(fileTree, (item, data) => ({
          ...item,
          data,
        }))
      }
      canDragAndDrop
      canDropOnFolder
      canDropOnNonFolder
      canReorderItems
      canSearch={false}
      getItemTitle={(item) => item.data}
      key={files.length}
      viewState={{}}
    >
      <Tree
        renderItem={({ children, context, depth, item, title }) => {
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
        }}
        renderItemsContainer={({ children, containerProps }) => (
          <ul {...containerProps}>{children}</ul>
        )}
        renderTreeContainer={({ children, containerProps }) => (
          <div {...containerProps}>{children}</div>
        )}
        rootItem="root"
        treeId="tree-1"
        treeLabel="Tree Example"
      />
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
