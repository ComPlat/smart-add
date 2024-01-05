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

  if (appendNumberIfDuplicate) {
    return `${cleanBaseName}_${highestCounter + 1}`
  }

  if (!appendNumberIfDuplicate && isDuplicate) {
    return `${cleanBaseName}_${highestCounter + 1}`
  }

  return cleanBaseName
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

  await filesDB.folders.add(folder)

  if (assignmentTree) {
    const folder_tmp = await filesDB.folders.get({ uid: folder.uid })
    await assignmentsDB.folders.put(folder_tmp as ExtendedFolder)
    await filesDB.folders.where({ uid: folder.uid }).delete()
  }
}

export const createSubFolders = async (basePath: string, names: string[]) =>
  await Promise.all(
    names.map((name) => createFolder(`${basePath}/${name}`, name, true)),
  )
