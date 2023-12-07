import { FileNode } from './types'

const createFilePaths = (
  fileTree: Record<string, FileNode>,
  root: string,
): { name: string; path: string; uid: string }[] => {
  const filePaths: { name: string; path: string; uid: string }[] = []

  const getFullPath = (
    currentPath: string,
    nodeData: string,
    isRoot: boolean,
  ) => (isRoot ? '' : `${currentPath}${currentPath ? '/' : ''}${nodeData}`)

  const traverseTree = (
    node: FileNode,
    currentPath: string,
    isRoot: boolean,
  ): Promise<void>[] => {
    const fullPath = getFullPath(currentPath, node.data, isRoot)
    filePaths.push({ name: node.data, path: fullPath, uid: node.uid! })

    return (node.children?.map((child: string) =>
      traverseTree(fileTree[child], fullPath, false),
    )).flat()
  }

  const rootFolder = fileTree[root]
  if (rootFolder) {
    traverseTree(rootFolder, '', true)
  }

  return filePaths
}

export { createFilePaths }
