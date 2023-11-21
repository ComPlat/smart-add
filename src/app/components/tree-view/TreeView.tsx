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
  const db = useLiveQuery(async () => {
    const files = await filesDB.files.toArray()
    const assignedFiles = await assignmentsDB.assignedFiles.toArray()
    const tree = retrieveTree(
      files,
      assignedFiles,
      'inputTreeRoot',
      'assignmentTreeRoot',
    )
    const treeDataProvider = new CustomTreeDataProvider(tree, (item, data) => ({
      ...item,
      data,
    }))
    const key = Date.now()

    return { assignedFiles, files, key, tree, treeDataProvider }
  })

  const [uploading, setUploading] = useState(false)

  if (!db) return <div>Loading...</div>

  return (
    <UncontrolledTreeEnvironment
      canDragAndDrop
      canDropAt={(items, target) => canDropAt(items, target, db.tree)}
      canDropOnFolder
      canReorderItems
      canSearch={false}
      dataProvider={db.treeDataProvider}
      getItemTitle={(item) => item.data}
      key={uploading ? 0 : db.key}
      onDrop={() => handleFileMove(db.tree, setUploading)}
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
        assignedFilesLength={db.assignedFiles.length}
        filesLength={db.files.length}
      />
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
