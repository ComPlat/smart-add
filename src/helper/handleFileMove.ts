import {
  AssignmentsDBCreator,
  FilesDBCreator,
  assignmentsDB,
  filesDB,
} from '@/database/db'
import { FileNode } from '@/helper/types'
import { Dispatch, SetStateAction } from 'react'
import { DraggingPosition, TreeItem, TreeItemIndex } from 'react-complex-tree'

const findItemInTable = async (
  itemFullPath: TreeItemIndex,
  db: AssignmentsDBCreator | FilesDBCreator,
  tableName: string,
) => {
  return db.table(tableName).get({ fullPath: itemFullPath })
}

const findItemInDatabases = async (itemFullPath: string) => {
  const databases = [filesDB, assignmentsDB]
  const tables = ['files', 'folders']

  const searchPromises = await Promise.all(
    databases.flatMap((db) =>
      tables.map((table) =>
        findItemInTable(itemFullPath, db, table).then((entry) =>
          entry ? { db, entry, table } : null,
        ),
      ),
    ),
  ).then((results) => results.filter(Boolean))

  return searchPromises.find((result) => result) || null
}

const updateChildPaths = async (
  tree: Record<string, FileNode>,
  parentNode: FileNode,
  newPath: string,
  oldPath: string,
  db: AssignmentsDBCreator | FilesDBCreator,
  targetDB: AssignmentsDBCreator | FilesDBCreator,
) => {
  const updatePromises = parentNode.children.flatMap((childIndex) => {
    const childNode = tree[childIndex]
    const childOldFullPath = `${oldPath}/${childNode.data}`
    const childNewFullPath = `${newPath}/${childNode.data}`
    const table = childNode.isFolder ? 'folders' : 'files'

    const updatePromise = db
      .table(table)
      .get({ uid: childNode.uid })
      .then((oldEntry: FileNode) => {
        const updateEntry = { ...oldEntry, fullPath: childNewFullPath }
        return targetDB.table(table).put(updateEntry)
      })

    const deletePromise =
      db.name !== targetDB.name
        ? db.table(table).where({ uid: childNode.uid }).delete()
        : null

    const recursiveUpdatePromise = childNode.isFolder
      ? updateChildPaths(
          tree,
          childNode,
          childNewFullPath,
          childOldFullPath,
          db,
          targetDB,
        )
      : null

    return [updatePromise, deletePromise, recursiveUpdatePromise].filter(
      Boolean,
    )
  })

  await Promise.all(updatePromises)
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
  setUploading: Dispatch<SetStateAction<boolean>>,
) => {
  setUploading(true)

  for (const item of items) {
    const dbResult = await findItemInDatabases(String(item.index))
    if (!dbResult) {
      console.error('Item not found in any database table:', item.index)
      return
    }

    const { db, entry, table } = dbResult

    const newPath = calculateNewPath(item, target)
    const oldPath = entry.fullPath

    const updatedEntry = { ...entry, fullPath: newPath }
    const targetDB = target.treeId === 'inputTree' ? filesDB : assignmentsDB

    if (db.name !== targetDB.name) {
      await targetDB.table(table).put(updatedEntry)
      await db.table(table).where({ uid: entry.uid }).delete()
    } else {
      await db.table(table).put(updatedEntry)
    }

    if (table === 'folders') {
      const folderNode = tree[item.index]
      await updateChildPaths(tree, folderNode, newPath, oldPath, db, targetDB)
    }
  }

  setUploading(false)
}

export { handleFileMove }
