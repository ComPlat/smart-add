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
  return db.table(tableName).where({ fullPath: itemFullPath }).first()
}

const findItemInDatabases = async (itemFullPath: TreeItemIndex) => {
  const databases = [filesDB, assignmentsDB]
  const tables = ['files', 'folders']

  for (const db of databases) {
    for (const table of tables) {
      const entry = await findItemInTable(itemFullPath, db, table)
      if (entry) {
        return { db: db, entry, table }
      }
    }
  }

  return null
}

const updateChildPaths = async (
  tree: Record<string, FileNode>,
  parentNode: FileNode,
  newPath: string,
  oldPath: string,
  db: AssignmentsDBCreator | FilesDBCreator,
  targetDB: AssignmentsDBCreator | FilesDBCreator,
) => {
  const children = parentNode.children

  for (const childIndex of children) {
    const childNode = tree[childIndex]
    const childOldFullPath = `${oldPath}/${childNode.data}`
    const childNewFullPath = `${newPath}/${childNode.data}`

    const oldEntry = await db
      .table(childNode.isFolder ? 'folders' : 'files')
      .where({ uid: childNode.uid })
      .first()

    await targetDB
      .table(childNode.isFolder ? 'folders' : 'files')
      .put({ ...oldEntry, fullPath: childNewFullPath })

    await db
      .table(childNode.isFolder ? 'folders' : 'files')
      .where({ uid: childNode.uid })
      .delete()

    if (childNode.isFolder) {
      await updateChildPaths(
        tree,
        childNode,
        childNewFullPath,
        childOldFullPath,
        db,
        targetDB,
      )
    }
  }
}

const handleFileMove = async (
  items: TreeItem[],
  target: DraggingPosition,
  tree: Record<string, FileNode>,
  setUploading: Dispatch<SetStateAction<boolean>>,
) => {
  setUploading(true)

  for (const item of items) {
    const dbResult = await findItemInDatabases(item.index)
    if (dbResult) {
      const { db, entry, table } = dbResult
      let newPath

      if (target.targetType === 'root') {
        newPath = `${item.data}`
      } else if (target.targetType === 'between-items') {
        const parentPath =
          target.parentItem === 'assignmentTreeRoot' ||
          target.parentItem === 'inputTreeRoot'
            ? ''
            : target.parentItem
        newPath = `${String(parentPath).length > 0 && parentPath + '/'}${
          item.data
        }`
      } else {
        newPath = `${target.targetItem}/${item.data}`
      }

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
    } else {
      console.error('Item not found in any database table:', item.index)
    }
  }

  setUploading(false)
}

export { handleFileMove }
