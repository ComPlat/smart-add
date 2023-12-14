import { assignmentsDB } from '@/database/db'
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

export const createFolder = async (path: string, name: string) =>
  await assignmentsDB.assignedFolders.add({
    fullPath: path,
    isFolder: true,
    name: name,
    parentUid: v4(),
    uid: v4(),
  })

export const createSubFolders = async (basePath: string, names: string[]) =>
  await Promise.all(
    names.map((name) => createFolder(`${basePath}/${name}`, name)),
  )
