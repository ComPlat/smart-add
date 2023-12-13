import { assignmentsDB } from '@/database/db'
import { FileNode } from '@/helper/types'
import { v4 } from 'uuid'

export const getUniqueFolderName = (
  baseName: string,
  tree: Record<string, FileNode>,
) => {
  const cleanBaseName = baseName.replace(/_\d+$/, '')

  let highestCounter = 0
  const baseNamePattern = new RegExp(`^${cleanBaseName}_(\\d+)$`)

  const searchTree = (node: FileNode) => {
    const match = node.data.match(baseNamePattern)
    if (match) {
      const counter = parseInt(match[1], 10)
      highestCounter = Math.max(highestCounter, counter)
    }

    if (node.children) {
      node.children.forEach((childName: string) => {
        if (tree[childName]) {
          searchTree(tree[childName])
        }
      })
    }
  }

  Object.values(tree).forEach(searchTree)

  const uniqueName = `${cleanBaseName}_${highestCounter + 1}`

  return uniqueName
}

export const createFolder = async (path: string, name: string) => {
  const folder = {
    fullPath: path,
    isFolder: true,
    name: name,
    parentUid: v4(),
    uid: v4(),
  }
  await assignmentsDB.assignedFolders.add(folder)
}

export const createSubFolders = async (basePath: string, names: string[]) => {
  for (const name of names) {
    await createFolder(`${basePath}/${name}`, name)
  }
}
