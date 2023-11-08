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

import { renderItem } from './renderItem'

const TreeView = () => {
  const files = useLiveQuery(() => filesDB.files.toArray(), [])

  if (!files) {
    return <div>Loading...</div>
  }

  const fileTree = constructTree(files)

  return (
    <>
      <style>{`
        :root {
          --rct-color-focustree-item-draggingover-bg: #ecdede;
          --rct-color-focustree-item-draggingover-color: inherit;
          --rct-color-search-highlight-bg: #7821e2;
          --rct-color-drag-between-line-bg: rgb(37 99 235);
        }
      `}</style>
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
          <div style={{ width: '50%' }}>
            <Tree
              renderItemsContainer={({ children, containerProps }) => (
                <ul {...containerProps}>{children}</ul>
              )}
              renderTreeContainer={({ children, containerProps }) => (
                <div {...containerProps}>{children}</div>
              )}
              renderItem={renderItem}
              rootItem="root"
              treeId="tree-1"
              treeLabel="Input Tree"
            />
          </div>
          <div style={{ width: '50%' }}>
            <Tree
              renderItemsContainer={({ children, containerProps }) => (
                <ul {...containerProps}>{children}</ul>
              )}
              renderTreeContainer={({ children, containerProps }) => (
                <div {...containerProps}>{children}</div>
              )}
              renderItem={renderItem}
              rootItem="root2"
              treeId="tree-2"
              treeLabel="Assignment Tree"
            />
          </div>
        </div>
      </UncontrolledTreeEnvironment>
    </>
  )
}

export { TreeView }
