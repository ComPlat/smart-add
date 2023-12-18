import { ExtendedFile, ExtendedFolder, assignmentsDB } from '@/database/db'
import { FileNode } from '@/helper/types'

const updatePath = (path: string, newName: string, oldName: string): string => {
  return path.replace(oldName, newName)
}

const updateChildren = async (
  folderTreeNode: FileNode,
  newName: string,
  item: ExtendedFile | ExtendedFolder,
  tree: Record<string, FileNode>,
) => {
  for (const child of folderTreeNode.children) {
    const folderEntry = await assignmentsDB.assignedFolders.get({
      fullPath: child,
    })
    const fileEntry = !folderEntry
      ? await assignmentsDB.assignedFiles.get({ fullPath: child })
      : null

    if (folderEntry) {
      const newFullPath = updatePath(folderEntry.fullPath, newName, item.name)
      await assignmentsDB.assignedFolders.put({
        ...folderEntry,
        fullPath: newFullPath,
      })

      const entryTreeNode = tree[folderEntry.fullPath]
      await updateChildren(entryTreeNode, newName, item, tree)
    } else if (fileEntry) {
      const newFullPath = updatePath(fileEntry.fullPath, newName, item.name)
      await assignmentsDB.assignedFiles.put({
        ...fileEntry,
        fullPath: newFullPath,
      })
    }
  }
}

const renameFolder = async (
  item: ExtendedFolder,
  tree: Record<string, FileNode>,
  newName: string,
) => {
  const folder = await assignmentsDB.assignedFolders.get({ uid: item.uid })
  if (!folder) return

  const updated = {
    ...folder,
    fullPath: folder.fullPath.includes('/')
      ? folder.fullPath.split('/').slice(0, -1).join('/') + '/' + newName
      : newName,
    name: newName,
  }

  const folderTreeNode = tree[folder.fullPath]

  await updateChildren(folderTreeNode, newName, item, tree)
  await assignmentsDB.assignedFolders.put(updated)
}

export default renameFolder
