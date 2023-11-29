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

import { renderItem } from '../tree-view/renderItem'
import { ExportFiles } from './ExportFiles'
import { UploadedFiles } from './UploadedFiles'

type FileTreeProps = {
  rootItem: string
  treeId: string
  treeLabel: string
}

const FileTree = ({ rootItem, treeId, treeLabel }: FileTreeProps) => {
  return (
    <div className="my-4 flex min-h-[150px] flex-col rounded-md bg-gray-100 px-2 [&>*]:min-h-full">
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
      <div className="ml-4 flex w-full flex-row justify-between gap-4">
        <UploadedFiles>
          <FileTree
            rootItem="inputTreeRoot"
            treeId="inputTree"
            treeLabel="Input Tree"
          />
        </UploadedFiles>
        <ExportFiles>
          <FileTree
            rootItem="assignmentTreeRoot"
            treeId="assignmentTree"
            treeLabel="Assignment Tree"
          />
        </ExportFiles>
      </div>
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
