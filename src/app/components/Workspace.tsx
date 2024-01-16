import {
  ExtendedFile,
  ExtendedFolder,
  assignmentsDB,
  filesDB,
} from '@/database/db'
import { canDropAt } from '@/helper/canDropAt'
import { handleFileMove } from '@/helper/handleFileMove'
import { retrieveTree } from '@/helper/retrieveTree'
import { FileNode } from '@/helper/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { Fragment, useMemo, useState } from 'react'
import {
  DraggingPosition,
  Tree,
  TreeItem,
  TreeItemIndex,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'

import ContextMenu from './context-menu/ContextMenu'
import { CustomTreeDataProvider } from './custom/CustomTreeDataProvider'
import { renderItem } from './tree-view/renderItem'
import { UploadDropZone } from './upload-form/UploadDropZone'
import { ExportFiles } from './workspace/ExportFiles'
import { ExportFilesText } from './workspace/ExportFilesText'
import { Toolbar } from './workspace/Toolbar'
import { UploadFilesText } from './workspace/UploadFilesText'
import { UploadedFiles } from './workspace/UploadedFiles'

type Database = {
  assignedFiles: ExtendedFile[]
  assignedFolders: ExtendedFolder[]
  assignedLength: number
  files: ExtendedFile[]
  folders: ExtendedFolder[]
  inputLength: number
  key: number
  tree: Record<string, FileNode>
  treeDataProvider: CustomTreeDataProvider<string>
}

const initialContextMenu = {
  show: false,
  x: 0,
  y: 0,
}

const Workspace = () => {
  const db = useLiveQuery(async () => {
    const files = await filesDB.files.toArray()
    const folders = await filesDB.folders.toArray()
    const assignedFiles = await assignmentsDB.files.toArray()
    const assignedFolders = await assignmentsDB.folders.toArray()
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

    const database: Database = {
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

    return database
  })

  const [uploading, setUploading] = useState(false)
  const [focusedItem, setFocusedItem] = useState<
    TreeItemIndex & (TreeItemIndex | TreeItemIndex[])
  >()
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([])

  const [contextMenu, setContextMenu] = useState(initialContextMenu)
  const [contextTarget, setContextTarget] = useState<
    ExtendedFile | ExtendedFolder
  >()

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

  const handleOnDrop = (items: TreeItem[], target: DraggingPosition) =>
    handleFileMove(items, target, db.tree, setUploading)

  const handleCanDropAt = (items: TreeItem[], target: DraggingPosition) =>
    canDropAt(items, target, db.tree)

  const handleFileTreeContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault()

    const { pageX, pageY } = e

    setContextTarget(undefined)
    setContextMenu({ show: true, x: pageX, y: pageY })
  }

  const handleAssignmentTreeContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault()

    const { pageX, pageY } = e

    setContextTarget(undefined)
    setContextMenu({ show: true, x: pageX, y: pageY })
  }

  const handleFileTreeItemContextMenu = async (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault()

    const { pageX, pageY, target } = e

    const targetElement = target as HTMLElement

    const fullPath = String(targetElement.dataset.mykey)

    const retrievedFile = await filesDB.files.get({ fullPath })
    const retrievedFolder = await filesDB.folders.get({
      fullPath,
    })

    const retrieved = retrievedFile || retrievedFolder
    if (!retrieved) return

    setContextTarget(retrieved)
    setContextMenu({ show: true, x: pageX, y: pageY })
  }

  const handleAssignmentTreeItemContextMenu = async (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault()

    const { pageX, pageY, target } = e

    const targetElement = target as HTMLElement

    const fullPath = String(targetElement.dataset.mykey)

    const retrievedFile = await assignmentsDB.files.get({ fullPath })
    const retrievedFolder = await assignmentsDB.folders.get({
      fullPath,
    })

    const retrieved = retrievedFile || retrievedFolder
    if (!retrieved) return

    setContextTarget(retrieved)
    setContextMenu({ show: true, x: pageX, y: pageY })
  }

  const contextMenuClose = () => setContextMenu(initialContextMenu)

  return (
    <Fragment>
      <Toolbar
        assignmentDBLength={db.assignedLength}
        inputDBLength={db.inputLength}
        tree={db.tree}
      />

      <UncontrolledTreeEnvironment
        canDrag={(items) =>
          items.every(
            (item) => item.data !== 'structure' && item.data !== 'analyses',
          )
        }
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
          <UploadedFiles onContextMenu={handleFileTreeContextMenu}>
            <UploadFilesText showText={db.inputLength === 0} />
            <UploadDropZone>
              <Tree
                renderItemsContainer={({ children, containerProps }) => (
                  <ul
                    onContextMenu={handleFileTreeItemContextMenu}
                    {...containerProps}
                  >
                    {children}
                  </ul>
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

          <ExportFiles onContextMenu={handleAssignmentTreeContextMenu}>
            <ExportFilesText showText={db.assignedLength === 0} />
            <Tree
              renderItemsContainer={({ children, containerProps }) => (
                <ul
                  onContextMenu={handleAssignmentTreeItemContextMenu}
                  {...containerProps}
                >
                  {children}
                </ul>
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
      {contextMenu.show && (
        <ContextMenu
          closeContextMenu={contextMenuClose}
          targetItem={contextTarget}
          tree={db.tree}
          x={contextMenu.x}
          y={contextMenu.y}
        />
      )}
    </Fragment>
  )
}

export default Workspace
