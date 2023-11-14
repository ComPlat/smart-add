'use client'

import { filesDB } from '@/database/db'
import { constructTree } from '@/helper/constructTree'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'

import styles from './TreeView.module.css'
import { renderItem } from './renderItem'

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
      canReorderItems
      canSearch={false}
      getItemTitle={(item) => item.data}
      // HINT: Rerender when number of files changes
      key={files.length}
      viewState={{}}
    >
      <div className="flex flex-row justify-between">
        <div className={styles['tree']}>
          <Tree
            renderItemsContainer={({ children, containerProps }) => (
              <ul {...containerProps}>{children}</ul>
            )}
            renderTreeContainer={({ children, containerProps }) => (
              <div {...containerProps}>{children}</div>
            )}
            renderItem={renderItem}
            rootItem="inputTreeRoot"
            treeId="tree-1"
            treeLabel="Input Tree"
          />
        </div>
        <div className={styles['tree']}>
          <Tree
            renderItemsContainer={({ children, containerProps }) => (
              <ul {...containerProps}>{children}</ul>
            )}
            renderTreeContainer={({ children, containerProps }) => (
              <div {...containerProps}>{children}</div>
            )}
            renderItem={renderItem}
            rootItem="assignmentTreeRoot"
            treeId="tree-2"
            treeLabel="Assignment Tree"
          />
        </div>
      </div>
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
