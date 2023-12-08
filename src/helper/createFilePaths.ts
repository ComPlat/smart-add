import { FileNode } from './types'

const getFullPath = (currentPath: string, nodeData: string, isRoot: boolean) =>
  isRoot ? '' : `${currentPath}${currentPath ? '/' : ''}${nodeData}`

const traverseTree = (
  fileTree: Record<string, FileNode>,
  node: FileNode,
  currentPath: string,
  isRoot: boolean,
  filePaths: { name: string; path: string; uid: string }[],
): Promise<void>[] => {
  const fullPath = getFullPath(currentPath, node.data, isRoot)
  filePaths.push({ name: node.data, path: fullPath, uid: node.uid! })

  return (node.children?.map((child: string) =>
    traverseTree(fileTree, fileTree[child], fullPath, false, filePaths),
  )).flat()
}

const createFilePaths = (
  fileTree: Record<string, FileNode>,
  root: string,
): { name: string; path: string; uid: string }[] => {
  const filePaths: { name: string; path: string; uid: string }[] = []

  const rootFolder = fileTree[root]
  if (rootFolder) {
    traverseTree(fileTree, rootFolder, '', true, filePaths)
  }

  return filePaths
}

export { createFilePaths }
