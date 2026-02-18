import {
  ExtendedFile,
  ExtendedFolder,
  FilesDBCreator,
  filesDB,
} from '@/database/db'
import { FileNode } from '@/helper/types'
import { dragNotifications } from '@/utils/dragNotifications'
import { DraggingPosition, TreeItem, TreeItemIndex } from 'react-complex-tree'

const findItemInTable = async (
  itemFullPath: TreeItemIndex,
  db: FilesDBCreator,
  tableName: string,
) => {
  return db.table(tableName).get({ fullPath: itemFullPath })
}

const findItemInDatabase = async (itemFullPath: string) => {
  const tables = ['files', 'folders']

  const searchPromises = await Promise.all(
    tables.map((table) =>
      findItemInTable(itemFullPath, filesDB, table).then((entry) =>
        entry ? { db: filesDB, entry, table } : null,
      ),
    ),
  ).then((results) => results.filter(Boolean))

  return searchPromises.find((result) => result) || null
}

const updateChildPaths = (
  tree: Record<string, FileNode>,
  parentNode: FileNode,
  newPath: string,
  newTreeId: string,
  updatesBatch: {
    fullPath: string
    isFolder: boolean
    parentUid: string
    treeId: string
    uid: string
  }[],
): {
  fullPath: string
  isFolder: boolean
  treeId: string
  uid: string
}[] => {
  parentNode.children.map((childIndex) => {
    const childNode = tree[childIndex]
    const childNewFullPath = `${newPath}/${childNode.data}`
    updatesBatch.push({
      fullPath: childNewFullPath,
      isFolder: childNode.isFolder,
      parentUid: String(parentNode.uid),
      treeId: newTreeId,
      uid: String(childNode.uid),
    })

    if (childNode.isFolder) {
      updateChildPaths(
        tree,
        childNode,
        childNewFullPath,
        newTreeId,
        updatesBatch,
      )
    }
  })

  return updatesBatch
}

const calculateNewPath = (item: TreeItem, target: DraggingPosition) => {
  if (target.targetType === 'root') {
    return `${item.data}`
  }

  if (target.targetType === 'between-items') {
    const parentPath =
      target.parentItem === 'assignmentTreeRoot' ||
      target.parentItem === 'inputTreeRoot'
        ? ''
        : target.parentItem
    return `${String(parentPath).length > 0 ? parentPath + '/' : ''}${
      item.data
    }`
  }

  return `${target.targetItem}/${item.data}`
}

const handleFileMove = async (
  items: TreeItem[],
  target: DraggingPosition,
  tree: Record<string, FileNode>,
) => {
  const updatesBatch: {
    fullPath: string
    isFolder: boolean
    parentUid: string
    treeId: string
    uid: string
  }[] = []

  const itemsPromises = items.map(async (item) => {
    const dbResult = await findItemInDatabase(String(item.index))
    if (!dbResult) {
      return console.error('Item not found in database:', item.index)
    }

    const { entry, table } = dbResult

    const newPath = calculateNewPath(item, target)
    const newTreeId =
      target.treeId === 'inputTree' ? 'inputTreeRoot' : 'assignmentTreeRoot'

    let parentUid = null
    if (target.targetType === 'item') {
      parentUid = tree[target.targetItem].uid
    } else if (target.targetType === 'between-items') {
      parentUid = tree[target.parentItem].uid
    } else if (target.targetType === 'root') {
      parentUid = null
    }

    updatesBatch.push({
      fullPath: newPath,
      isFolder: table === 'folders',
      parentUid: String(parentUid),
      treeId: newTreeId,
      uid: entry.uid,
    })

    if (table === 'folders') {
      const folderNode = tree[item.index]
      updateChildPaths(tree, folderNode, newPath, newTreeId, updatesBatch)
    }
  })

  await Promise.all(itemsPromises)

  if (updatesBatch.length === 0) return

  await filesDB.transaction(
    'rw',
    filesDB.files,
    filesDB.folders,
    async () => {
      await Promise.all(
        updatesBatch.map(async (update) => {
          const table = update.isFolder ? filesDB.folders : filesDB.files
          const item = await table.get({ uid: update.uid })
          if (!item)
            return console.error('Item not found in database:', update.uid)
          item.fullPath = update.fullPath
          item.parentUid = update.parentUid
          item.treeId = update.treeId
          if (item.metadata) {
            item.metadata.parent_id = update.parentUid
            item.metadata.ancestry = update.parentUid
            item.metadata.updated_at = new Date().toISOString()
          }
          await table.put(item as ExtendedFile & ExtendedFolder)
        }),
      )

      // Update positions when an analysis is reordered within its analyses parent
      if (target.targetType === 'between-items' && items.length === 1) {
        const sourceNode = tree[items[0].index]
        const parentNode = tree[target.parentItem]
        if (sourceNode?.dtype === 'analysis' && parentNode?.dtype === 'analyses') {
          const siblings = await filesDB.folders
            .where('parentUid')
            .equals(String(parentNode.uid))
            .and((f) => f.dtype === 'analysis')
            .toArray()
          const treeChildren = parentNode.children ?? []
          siblings.sort((a, b) =>
            (a.position ?? treeChildren.indexOf(a.fullPath)) -
            (b.position ?? treeChildren.indexOf(b.fullPath)),
          )
          const draggedUid = String(sourceNode.uid)
          const dragged = siblings.find((s) => s.uid === draggedUid)
          const withoutDragged = siblings.filter((s) => s.uid !== draggedUid)
          if (dragged) {
            const originalIndex = treeChildren.indexOf(dragged.fullPath)
            const insertAt = Math.min(
              originalIndex < target.childIndex ? target.childIndex - 1 : target.childIndex,
              withoutDragged.length,
            )
            withoutDragged.splice(insertAt, 0, dragged)
          }
          await Promise.all(withoutDragged.map((f, idx) => filesDB.folders.update(f.id!, { position: idx })))
        }
      }
    },
  )

  // Show success notification after successful drop
  dragNotifications.showSuccess(
    `Successfully moved ${items.length} item${items.length > 1 ? 's' : ''}!`,
  )
}

export { handleFileMove }
