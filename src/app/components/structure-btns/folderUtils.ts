import { ExtendedFolder, assignmentsDB, filesDB } from '@/database/db'
import { FileNode } from '@/helper/types'
import { v4 } from 'uuid'

export const getUniqueFolderName = (
  folderName: string,
  tree: Record<string, FileNode>,
  baseName: string,
) => {
  const cleanBaseName = folderName.replace(/_\d+$/, '') || baseName
  const baseNamePattern = new RegExp(`^${cleanBaseName}_(\\d+)$`)

  const searchTree = (node: FileNode) => {
    const match = node.data.match(baseNamePattern)
    return match ? parseInt(match[1], 10) : 0
  }

  const highestCounter = Math.max(...Object.values(tree).map(searchTree))
  return `${cleanBaseName}_${highestCounter + 1}`
}

export const createFolder = async (path: string, name: string) => {
  const folder = {
    fullPath: path,
    isFolder: true,
    name,
    parentUid: '',
    uid: v4() + ' ' + v4(),
  }

  // HINT: This is necessary because directly uploading new folders to the assignmentsDB
  //       causes issues when then trying to move folders from input tree to assignments
  //       tree
  await filesDB.folders.put(folder)
  const folder_tmp = await filesDB.folders.get({ uid: folder.uid })
  await assignmentsDB.assignedFolders.put(folder_tmp as ExtendedFolder)
  await filesDB.folders.where({ uid: folder.uid }).delete()
}

export const createSubFolders = async (basePath: string, names: string[]) =>
  await Promise.all(
    names.map((name) => createFolder(`${basePath}/${name}`, name)),
  )
