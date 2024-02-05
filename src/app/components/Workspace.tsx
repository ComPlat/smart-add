'use client'

import { ExtendedFile, ExtendedFolder, filesDB } from '@/database/db'
import { canDropAt } from '@/helper/canDropAt'
import { handleFileMove } from '@/helper/handleFileMove'
import { retrieveTree } from '@/helper/retrieveTree'
import { FileNode } from '@/helper/types'
import { getTotalLength } from '@/helper/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { Fragment, useState } from 'react'
import {
  ControlledTreeEnvironment,
  DraggingPosition,
  Tree,
  TreeItem,
  TreeItemIndex,
} from 'react-complex-tree'

import AssignmentTreeContextMenu from './context-menu/AssignmentTreeContextMenu'
import FileTreeContextMenu from './context-menu/FileTreeContextMenu'
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
}

const initialContextMenu = {
  show: false,
  x: 0,
  y: 0,
}

const [inputTreeRoot, assignmentTreeRoot] = [
  'inputTreeRoot',
  'assignmentTreeRoot',
]

const Workspace = () => {
  const [tree, setTree] = useState({} as Record<string, FileNode>)

  const db = useLiveQuery(async () => {
    const files = await filesDB.files.toArray()
    const folders = await filesDB.folders.toArray()
    const retrievedInputTree = retrieveTree(files, folders, inputTreeRoot)
    const retrievedAssignmentTree = retrieveTree(
      files,
      folders,
      assignmentTreeRoot,
    )
    setTree({ ...retrievedInputTree, ...retrievedAssignmentTree })
    const key = Date.now()

    const assignedFiles = files.filter(
      (file) => file.treeId === assignmentTreeRoot,
    )
    const assignedFolders = folders.filter(
      (folder) => folder.treeId === assignmentTreeRoot,
    )

    const inputLength = getTotalLength(files, folders, inputTreeRoot)
    const assignedLength = getTotalLength(files, folders, assignmentTreeRoot)

    const database: Database = {
      assignedFiles,
      assignedFolders,
      assignedLength,
      files,
      folders,
      inputLength,
      key,
    }

    return database
  })

  const [focusedItem, setFocusedItem] = useState<
    TreeItemIndex & (TreeItemIndex | TreeItemIndex[])
  >()
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([])
  const [selectedItems, setSelectedItems] = useState<TreeItemIndex[]>([])

  const [fileTreeContextMenu, setFileTreeContextMenu] =
    useState(initialContextMenu)
  const [assignmentTreeContextMenu, setAssignmentTreeContextMenu] =
    useState(initialContextMenu)
  const [contextTarget, setContextTarget] = useState<
    ExtendedFile | ExtendedFolder
  >()

  if (!db) return <div>Loading...</div>

  const viewState = {
    ['assignmentTree']: {
      expandedItems,
      focusedItem,
      selectedItems,
    },
    ['inputTree']: {
      expandedItems,
      focusedItem,
      selectedItems,
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

  const handleOnSelectItem = (items: TreeItemIndex[]) => setSelectedItems(items)

  const handleOnDrop = (items: TreeItem[], target: DraggingPosition) =>
    handleFileMove(items, target, tree)

  const handleCanDropAt = (items: TreeItem[], target: DraggingPosition) =>
    canDropAt(items, target, tree)

  const handleFileTreeContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault()

    const { pageX, pageY } = e

    setContextTarget(undefined)
    setFileTreeContextMenu({ show: true, x: pageX, y: pageY })
    assignmentTreeContextMenuClose()
  }

  const handleAssignmentTreeContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault()

    const { pageX, pageY } = e

    setContextTarget(undefined)
    setAssignmentTreeContextMenu({ show: true, x: pageX, y: pageY })
    fileTreeContextMenuClose()
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
    setFileTreeContextMenu({ show: true, x: pageX, y: pageY })
  }

  const handleAssignmentTreeItemContextMenu = async (
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
    setAssignmentTreeContextMenu({ show: true, x: pageX, y: pageY })
  }

  const fileTreeContextMenuClose = () =>
    setFileTreeContextMenu(initialContextMenu)
  const assignmentTreeContextMenuClose = () =>
    setAssignmentTreeContextMenu(initialContextMenu)

  return (
    <Fragment>
      <Toolbar
        assignedLength={db.assignedLength}
        inputLength={db.inputLength}
        tree={tree}
      />
      <ControlledTreeEnvironment
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
        getItemTitle={(item: TreeItem) => item.data}
        items={tree}
        onCollapseItem={handleOnCollapseItem}
        onDrop={handleOnDrop}
        onExpandItem={handleOnExpandItem}
        onFocusItem={handleOnFocusItem}
        onSelectItems={handleOnSelectItem}
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
                rootItem={inputTreeRoot}
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
              rootItem={assignmentTreeRoot}
              treeId="assignmentTree"
              treeLabel="Assignment Tree"
            />
          </ExportFiles>
        </div>
      </ControlledTreeEnvironment>
      {fileTreeContextMenu.show && (
        <FileTreeContextMenu
          closeContextMenu={fileTreeContextMenuClose}
          targetItem={contextTarget}
          tree={tree}
          x={fileTreeContextMenu.x}
          y={fileTreeContextMenu.y}
        />
      )}
      {assignmentTreeContextMenu.show && (
        <AssignmentTreeContextMenu
          closeContextMenu={assignmentTreeContextMenuClose}
          targetItem={contextTarget}
          tree={tree}
          x={assignmentTreeContextMenu.x}
          y={assignmentTreeContextMenu.y}
        />
      )}
    </Fragment>
  )
}

export default Workspace
