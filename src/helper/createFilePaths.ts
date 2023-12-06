import { FileNode } from './types'

const createFilePaths = (
  fileTree: Record<string, FileNode>,
  root: string,
): { name: string; path: string; uid: string }[] => {
  const filePaths: { name: string; path: string; uid: string }[] = []

  const traverseTree = (
    node: FileNode,
    currentPath: string,
    isRoot: boolean,
  ) => {
    const fullPath = isRoot
      ? ''
      : `${currentPath}${currentPath ? '/' : ''}${node.data}`
    filePaths.push({ name: node.data, path: fullPath, uid: String(node.uid) })

    for (const child of node.children || []) {
      traverseTree(fileTree[child], fullPath, false)
    }
  }

  const rootFolder = fileTree[root]
  if (rootFolder) {
    traverseTree(rootFolder, '', true)
  }

  return filePaths
}

export { createFilePaths }
