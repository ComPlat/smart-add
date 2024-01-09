import { ExtendedFile, ExtendedFolder, filesDB } from '@/database/db'
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
  const updatePromises = []

  for (const child of folderTreeNode.children) {
    updatePromises.push(
      (async () => {
        const folderEntry = await filesDB.folders.get({
          fullPath: child,
        })
        const fileEntry = !folderEntry
          ? await filesDB.files.get({ fullPath: child })
          : null

        if (folderEntry) {
          const newFullPath = updatePath(
            folderEntry.fullPath,
            newName,
            item.name,
          )
          await filesDB.folders.put({
            ...folderEntry,
            fullPath: newFullPath,
          })

          const entryTreeNode = tree[folderEntry.fullPath]
          updatePromises.push(
            updateChildren(entryTreeNode, newName, item, tree),
          )
        } else if (fileEntry) {
          const newFullPath = updatePath(fileEntry.fullPath, newName, item.name)
          await filesDB.files.put({
            ...fileEntry,
            fullPath: newFullPath,
          })
        }
      })(),
    )
  }

  await Promise.all(updatePromises)
}

const renameFolder = async (
  item: ExtendedFolder,
  tree: Record<string, FileNode>,
  newName: string,
) => {
  const folder = await filesDB.folders.get({ uid: item.uid })
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
  await filesDB.folders.put(updated)
}

export default renameFolder
