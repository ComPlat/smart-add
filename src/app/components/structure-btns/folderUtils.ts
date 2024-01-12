import { ExtendedFolder, assignmentsDB, filesDB } from '@/database/db'
import { FileNode } from '@/helper/types'
import { v4 } from 'uuid'

export const getUniqueFolderName = (
  folderName: string,
  tree: Record<string, FileNode>,
  baseName: string,
  appendNumberIfDuplicate: boolean = true,
) => {
  const cleanBaseName = folderName.replace(/_\d+$/, '') || baseName
  const baseNamePattern = new RegExp(`^${cleanBaseName}(_\\d+)?$`)

  const searchTree = (node: FileNode) => {
    const match = node.data.match(baseNamePattern)
    return match && match[1] ? parseInt(match[1].substring(1), 10) : 0
  }

  const highestCounter = Math.max(...Object.values(tree).map(searchTree), 0)

  const isDuplicate = Object.values(tree).some(
    (node) => node.data === cleanBaseName,
  )

  if (!appendNumberIfDuplicate && !isDuplicate) {
    return cleanBaseName
  }

  return `${cleanBaseName}_${highestCounter + 1}`
}

export const createFolder = async (
  path: string,
  name: string,
  assignmentTree: boolean = false,
) => {
  const folder = {
    fullPath: path,
    isFolder: true,
    name: name,
    parentUid: v4(),
    uid: v4(),
  }

  await filesDB.folders.put(folder)

  if (assignmentTree) {
    // HINT: This is necessary because directly uploading new folders to the assignmentsDB
    //       causes issues when then trying to move folders from input tree to assignments
    //       tree
    const folder_tmp = await filesDB.folders.get({ uid: folder.uid })
    await assignmentsDB.folders.put(folder_tmp as ExtendedFolder)
    await filesDB.folders.where({ uid: folder.uid }).delete()
  }
}

export const createSubFolders = async (basePath: string, names: string[]) =>
  await Promise.all(
    names.map((name) => createFolder(`${basePath}/${name}`, name, true)),
  )
