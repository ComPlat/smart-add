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

import styles from '../tree-view/TreeView.module.css'
import { renderItem } from '../tree-view/renderItem'

type FileTreeProps = {
  rootItem: string
  treeId: string
  treeLabel: string
}

const FileTree = ({ rootItem, treeId, treeLabel }: FileTreeProps) => {
  return (
    <div className={styles['tree']}>
      <Tree
        renderItemsContainer={({ children, containerProps }) => (
          <ul {...containerProps}>{children}</ul>
        )}
        renderTreeContainer={({ children, containerProps }) => (
          <div {...containerProps}>{children}</div>
        )}
        renderItem={renderItem}
        rootItem={rootItem}
        treeId={treeId}
        treeLabel={treeLabel}
      />
    </div>
  )
}

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
      canDropAt={(_items, target) => target.treeId === 'assignmentTree'}
      canDropOnFolder
      canReorderItems
      canSearch={false}
      getItemTitle={(item) => item.data}
      // HINT: Rerender when number of files changes
      key={files.length}
      viewState={{}}
    >
      <div className="flex flex-row justify-between">
        <FileTree
          rootItem="inputTreeRoot"
          treeId="inputTree"
          treeLabel="Input Tree"
        />

        <FileTree
          rootItem="assignmentTreeRoot"
          treeId="assignmentTree"
          treeLabel="Assignment Tree"
        />
      </div>
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
