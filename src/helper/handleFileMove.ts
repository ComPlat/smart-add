import { FilesDBCreator, filesDB } from '@/database/db'
import { FileNode } from '@/helper/types'
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
    treeId: string
    uid: string
  }[],
) => {
  parentNode.children.forEach((childIndex) => {
    const childNode = tree[childIndex]
    const childNewFullPath = `${newPath}/${childNode.data}`
    updatesBatch.push({
      fullPath: childNewFullPath,
      isFolder: childNode.isFolder,
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
    treeId: string
    uid: string
  }[] = []

  await Promise.all(
    items.map(async (item) => {
      const dbResult = await findItemInDatabase(String(item.index))
      if (!dbResult) {
        console.error('Item not found in database:', item.index)
        return
      }

      const { entry, table } = dbResult

      const newPath = calculateNewPath(item, target)
      const newTreeId =
        target.treeId === 'inputTree' ? 'inputTreeRoot' : 'assignmentTreeRoot'

      updatesBatch.push({
        fullPath: newPath,
        isFolder: table === 'folders',
        treeId: newTreeId,
        uid: entry.uid,
      })

      if (table === 'folders') {
        const folderNode = tree[item.index]
        updateChildPaths(tree, folderNode, newPath, newTreeId, updatesBatch)
      }
    }),
  )

  if (updatesBatch.length === 0) return

  await filesDB.transaction('rw', filesDB.files, filesDB.folders, async () => {
    await Promise.all(
      updatesBatch.map(async (update) => {
        const table = update.isFolder ? filesDB.folders : filesDB.files
        return table
          .where({ uid: update.uid })
          .modify({ fullPath: update.fullPath, treeId: update.treeId })
      }),
    )
  })
}

export { handleFileMove }
