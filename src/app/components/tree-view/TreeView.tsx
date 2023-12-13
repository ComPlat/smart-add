'use client'

import { assignmentsDB, filesDB } from '@/database/db'
import { canDropAt } from '@/helper/canDropAt'
import { handleFileMove } from '@/helper/handleFileMove'
import { retrieveTree } from '@/helper/retrieveTree'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import {
  DraggingPosition,
  Tree,
  TreeItem,
  TreeItemIndex,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'

import { CustomTreeDataProvider } from '../custom/CustomTreeDataProvider'
import AddReaction from '../structure-btns/AddReaction'
import AddSample from '../structure-btns/AddSample'
import ClearButtonGroup from './ClearButtonGroup'
import styles from './TreeView.module.css'
import { UploadSpinner } from './UploadSpinner'
import { renderItem } from './renderItem'

const TreeView = () => {
  const db = useLiveQuery(async () => {
    const files = await filesDB.files.toArray()
    const folders = await filesDB.folders.toArray()
    const assignedFiles = await assignmentsDB.assignedFiles.toArray()
    const assignedFolders = await assignmentsDB.assignedFolders.toArray()
    const tree = retrieveTree(
      files,
      folders,
      'inputTreeRoot',
      assignedFiles,
      assignedFolders,
      'assignmentTreeRoot',
    )
    const treeDataProvider = new CustomTreeDataProvider(tree, (item, data) => ({
      ...item,
      data,
    }))
    const key = Date.now()

    const assignedLength = assignedFiles.length + assignedFolders.length
    const inputLength = files.length + folders.length

    return {
      assignedFiles,
      assignedFolders,
      assignedLength,
      files,
      folders,
      inputLength,
      key,
      tree,
      treeDataProvider,
    }
  })

  const [uploading, setUploading] = useState(false)
  const [focusedItem, setFocusedItem] = useState<
    TreeItemIndex & (TreeItemIndex | TreeItemIndex[])
  >()
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([])

  const memoizedKey = useMemo(
    () => (db ? (uploading ? 0 : db.key) : null),
    [uploading, db],
  )

  if (!db) return <div>Loading...</div>

  const viewState = {
    ['assignmentTree']: {
      expandedItems,
      focusedItem,
    },
    ['inputTree']: {
      expandedItems,
      focusedItem,
    },
  }

  const handleOnCollapseItem = (item: TreeItem) =>
    setExpandedItems(
      expandedItems.filter(
        (expandedItemIndex) => expandedItemIndex !== item.index,
      ),
    )

  const handleOnExpandItem = (item: TreeItem) =>
    setExpandedItems([...expandedItems, item.index])

  const handleOnFocusItem = (item: TreeItem) => setFocusedItem(item.index)

  const handleOnDrop = () => handleFileMove(db.tree, setUploading)

  const handleCanDropAt = (items: TreeItem[], target: DraggingPosition) =>
    canDropAt(items, target, db.tree)

  return (
    <UncontrolledTreeEnvironment
      canDragAndDrop
      canDropAt={handleCanDropAt}
      canDropOnFolder
      canReorderItems
      canSearch={false}
      dataProvider={db.treeDataProvider}
      getItemTitle={(item: TreeItem) => item.data}
      key={memoizedKey}
      onCollapseItem={handleOnCollapseItem}
      onDrop={handleOnDrop}
      onExpandItem={handleOnExpandItem}
      onFocusItem={handleOnFocusItem}
      viewState={viewState}
    >
      <div className="flex">
        <div className="flex-1"></div>
        <div className="flex flex-1">
          <AddSample className="flex-1" tree={db.tree} />
          <AddReaction className="flex-1" tree={db.tree} />
        </div>
      </div>

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

      {/* <AddFoldersButton tree={db.tree} /> */}

      <ClearButtonGroup
        assignmentDBLength={db.assignedLength}
        inputDBLength={db.inputLength}
      />
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
