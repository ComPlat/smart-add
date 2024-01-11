import { assignmentsDB, filesDB } from '@/database/db'
import { canDropAt } from '@/helper/canDropAt'
import { handleFileMove } from '@/helper/handleFileMove'
import { retrieveTree } from '@/helper/retrieveTree'
import { useLiveQuery } from 'dexie-react-hooks'
import { Fragment, useMemo, useState } from 'react'
import {
  DraggingPosition,
  Tree,
  TreeItem,
  TreeItemIndex,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'

import { CustomTreeDataProvider } from './custom/CustomTreeDataProvider'
import { renderItem } from './tree-view/renderItem'
import { UploadDropZone } from './upload-form/UploadDropZone'
import { ExportFiles } from './workspace/ExportFiles'
import { ExportFilesText } from './workspace/ExportFilesText'
import { Toolbar } from './workspace/Toolbar'
import { UploadFilesText } from './workspace/UploadFilesText'
import { UploadedFiles } from './workspace/UploadedFiles'

const Workspace = () => {
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
    <Fragment>
      <Toolbar
        assignmentDBLength={db.assignedLength}
        inputDBLength={db.inputLength}
        tree={db.tree}
      />

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
        <div className="flex min-h-full w-full flex-row justify-between overflow-hidden">
          <UploadedFiles>
            <UploadFilesText showText={db.inputLength === 0} />
            <UploadDropZone>
              <Tree
                renderItemsContainer={({ children, containerProps }) => (
                  <ul {...containerProps}>{children}</ul>
                )}
                renderTreeContainer={({ children, containerProps }) => (
                  <div className="min-h-screen" {...containerProps}>
                    {children}
                  </div>
                )}
                renderItem={renderItem}
                rootItem="inputTreeRoot"
                treeId="inputTree"
                treeLabel="Input Tree"
              />
            </UploadDropZone>
          </UploadedFiles>

          <p className="min-h-screen w-2 bg-gray-100" />

          <ExportFiles>
            <ExportFilesText showText={db.assignedLength === 0} />
            <Tree
              renderItemsContainer={({ children, containerProps }) => (
                <ul {...containerProps}>{children}</ul>
              )}
              renderTreeContainer={({ children, containerProps }) => (
                <div className="min-h-screen" {...containerProps}>
                  {children}
                </div>
              )}
              renderItem={renderItem}
              rootItem="assignmentTreeRoot"
              treeId="assignmentTree"
              treeLabel="Assignment Tree"
            />
          </ExportFiles>
        </div>
      </UncontrolledTreeEnvironment>
    </Fragment>
  )
}

export default Workspace
