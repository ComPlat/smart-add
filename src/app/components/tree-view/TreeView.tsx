'use client'

import { assignmentsDB, filesDB } from '@/database/db'
import { canDropAt } from '@/helper/canDropAt'
import { handleFileMove } from '@/helper/handleFileMove'
import { retrieveTree } from '@/helper/retrieveTree'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Tree, UncontrolledTreeEnvironment } from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'

import { CustomTreeDataProvider } from '../custom/CustomTreeDataProvider'
import ClearButtonGroup from './ClearButtonGroup'
import styles from './TreeView.module.css'
import { UploadSpinner } from './UploadSpinner'
import { renderItem } from './renderItem'

const TreeView = () => {
  const files = useLiveQuery(() => filesDB.files.toArray() || [])
  const assignedFiles = useLiveQuery(
    () => assignmentsDB.assignedFiles.toArray() || [],
  )

  const [uploading, setUploading] = useState(false)

  const treeData = retrieveTree(
    files ?? [],
    assignedFiles ?? [],
    'inputTreeRoot',
    'assignmentTreeRoot',
  )

  if (!treeData) {
    return <div>Loading...</div>
  }

  const treeDataProvider = new CustomTreeDataProvider(
    treeData,
    (item, data) => ({
      ...item,
      data,
    }),
  )

  treeDataProvider.onDidChangeTreeData(() =>
    handleFileMove(treeData, setUploading),
  )

  return (
    <UncontrolledTreeEnvironment
      canDragAndDrop
      canDropAt={(items, target) => canDropAt(items, target, treeData)}
      canDropOnFolder
      canReorderItems
      canSearch={false}
      dataProvider={treeDataProvider}
      getItemTitle={(item) => item.data}
      key={uploading ? 0 : files?.length || assignedFiles?.length}
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
            treeId="inputTree"
            treeLabel="Input Tree"
          />
        </div>

        <UploadSpinner isUploading={uploading} />

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
            treeId="assignmentTree"
            treeLabel="Assignment Tree"
          />
        </div>
      </div>

      <ClearButtonGroup
        assignedFilesLength={assignedFiles?.length || 0}
        filesLength={files?.length || 0}
      />
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
