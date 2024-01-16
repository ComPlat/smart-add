import { ExtendedFile, ExtendedFolder, filesDB } from '@/database/db'
import { FileNode } from '@/helper/types'

const updatePath = (path: string, newName: string, oldName: string): string => {
  return path.replace(oldName, newName)
}

const collectUpdates = async (
  folderTreeNode: FileNode,
  newName: string,
  item: ExtendedFile | ExtendedFolder,
  tree: Record<string, FileNode>,
  updates: { files: ExtendedFile[]; folders: ExtendedFolder[] },
) => {
  for (const child of folderTreeNode.children) {
    const folderEntry = await filesDB.folders.get({ fullPath: child })
    const fileEntry = !folderEntry
      ? await filesDB.files.get({ fullPath: child })
      : null

    if (folderEntry) {
      const newFullPath = updatePath(folderEntry.fullPath, newName, item.name)
      updates.folders.push({ ...folderEntry, fullPath: newFullPath })

      const entryTreeNode = tree[folderEntry.fullPath]
      await collectUpdates(entryTreeNode, newName, item, tree, updates)
    } else if (fileEntry) {
      const newFullPath = updatePath(fileEntry.fullPath, newName, item.name)
      updates.files.push({ ...fileEntry, fullPath: newFullPath })
    }
  }
}

const renameFolder = async (
  item: ExtendedFolder,
  tree: Record<string, FileNode>,
  newName: string,
) => {
  const folder = await filesDB.folders.get({ uid: item.uid })
  if (!folder) return

  const updatedFolder = {
    ...folder,
    fullPath: folder.fullPath.includes('/')
      ? folder.fullPath.split('/').slice(0, -1).join('/') + '/' + newName
      : newName,
    name: newName,
  }

  const folderTreeNode = tree[folder.fullPath]
  const updates = { files: [], folders: [updatedFolder] }

  await collectUpdates(folderTreeNode, newName, item, tree, updates)

  // Perform bulk updates
  await Promise.all([
    filesDB.folders.bulkPut(updates.folders),
    filesDB.files.bulkPut(updates.files),
  ])
}

export default renameFolder
