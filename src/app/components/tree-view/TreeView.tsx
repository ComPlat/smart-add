'use client'

import { assignmentsDB, filesDB } from '@/database/db'
import { constructTree } from '@/helper/constructTree'
import { handleFileMove } from '@/helper/handleFileMove'
import { Button, Spin } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
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

        <>
          {uploading && (
            <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
              <Spin size="large" />
            </div>
          )}
        </>

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

      <div className="flex">
        <Button
          onClick={() => {
            filesDB.files.clear()
            window.location.reload()
          }}
          className="mr-2 w-1/2"
          danger
          disabled={files?.length === 0}
        >
          Clear Files DB
        </Button>
        <Button
          onClick={() => {
            assignmentsDB.assignedFiles.clear()
            window.location.reload()
          }}
          className=" mr-2 w-1/2"
          danger
          disabled={assignedFiles?.length === 0}
        >
          Clear Assignment DB
        </Button>
      </div>
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
