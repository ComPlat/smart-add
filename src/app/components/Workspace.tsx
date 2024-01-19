'use client'

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
import { useState } from 'react'
import {
  ControlledTreeEnvironment,
  DraggingPosition,
  Tree,
  TreeItem,
  TreeItemIndex,
} from 'react-complex-tree'

import ContextMenu from './context-menu/ContextMenu'
import { renderItem } from './tree-view/renderItem'
import { UploadDropZone } from './upload-form/UploadDropZone'
import { ExportFiles } from './workspace/ExportFiles'
import { ExportFilesText } from './workspace/ExportFilesText'
import Header from './workspace/Header'
import { Toolbar } from './workspace/Toolbar'
import { UploadFilesText } from './workspace/UploadFilesText'
import { UploadedFiles } from './workspace/UploadedFiles'

const initialContextMenu = {
  show: false,
  x: 0,
  y: 0,
}

const Workspace = () => {
  const [tree, setTree] = useState({} as Record<string, FileNode>)

  const db = useLiveQuery(async () => {
    const files = await filesDB.files.toArray()
    const folders = await filesDB.folders.toArray()
    const assignedFiles = await assignmentsDB.files.toArray()
    const assignedFolders = await assignmentsDB.folders.toArray()
    const retrievedTree = retrieveTree(
      files,
      folders,
      'inputTreeRoot',
      assignedFiles,
      assignedFolders,
      'assignmentTreeRoot',
    )
    setTree(retrievedTree)
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
    }
  })

  const [focusedItem, setFocusedItem] = useState<
    TreeItemIndex & (TreeItemIndex | TreeItemIndex[])
  >()
  const [expandedItems, setExpandedItems] = useState<TreeItemIndex[]>([])

  const [contextMenu, setContextMenu] = useState(initialContextMenu)
  const [contextTarget, setContextTarget] = useState<
    ExtendedFile | ExtendedFolder
  >()

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
    handleFileMove(items, target, tree)

  const handleCanDropAt = (items: TreeItem[], target: DraggingPosition) =>
    canDropAt(items, target, tree)

  const handleDefaultContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault()

    const { pageX, pageY } = e

    setContextTarget(undefined)
    setContextMenu({ show: true, x: pageX, y: pageY })
  }

  const handleItemContextMenu = async (
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

  const contextMenuClose = () => setContextMenu(initialContextMenu)

  return (
    <main className="flex flex-col overflow-hidden bg-gray-100">
      <Header />
      <Toolbar
        assignmentDBLength={db.assignedLength}
        inputDBLength={db.inputLength}
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
        viewState={viewState}
      >
        <div className="flex min-h-full w-full flex-row justify-between overflow-hidden">
          <UploadedFiles onContextMenu={handleDefaultContextMenu}>
            <UploadFilesText showText={db.inputLength === 0} />
            <UploadDropZone>
              <Tree
                renderItemsContainer={({ children, containerProps }) => (
                  <ul onContextMenu={handleItemContextMenu} {...containerProps}>
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
      </ControlledTreeEnvironment>
      {contextMenu.show && (
        <ContextMenu
          closeContextMenu={contextMenuClose}
          targetItem={contextTarget}
          tree={tree}
          x={contextMenu.x}
          y={contextMenu.y}
        />
      )}
    </main>
  )
}

export default Workspace
