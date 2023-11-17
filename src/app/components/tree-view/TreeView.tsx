'use client'

import { assignmentsDB, filesDB } from '@/database/db'
import { constructTree } from '@/helper/constructTree'
import { handleFileMove } from '@/helper/handleFileMove'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'

import ClearButtonGroup from './ClearButtonGroup'
import styles from './TreeView.module.css'
import { UploadSpinner } from './UploadSpinner'
import { renderItem } from './renderItem'

const TreeView = () => {
  const files = useLiveQuery(() => filesDB.files.toArray(), [])
  const assignedFiles = useLiveQuery(
    () => assignmentsDB.assignedFiles.toArray(),
    [],
  )

  const [uploading, setUploading] = useState(false)

  const treeData = useMemo(() => {
    if (files && assignedFiles) {
      return constructTree(
        files,
        assignedFiles,
        'inputTreeRoot',
        'assignmentTreeRoot',
      )
    }
    return null
  }, [files, assignedFiles])

  if (!treeData) {
    return <div>Loading...</div>
  }

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(treeData, (item, data) => ({
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
      key={uploading ? 0 : files?.length || assignedFiles?.length}
      onDrop={() => handleFileMove(treeData, setUploading)}
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
