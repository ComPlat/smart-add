import { ExtendedFile } from '@/database/db'
import { FileNode } from '@/helper/types'

const addFoldersToTree = (
  fileTree: Record<string, FileNode>,
  path: string[],
  node: FileNode,
  root: string,
): void => {
  const currentPath = path.reduce((accumulatedPath, currentFolder) => {
    const newPath =
      accumulatedPath === root
        ? currentFolder
        : `${accumulatedPath}/${currentFolder}`

    if (!fileTree[newPath]) {
      fileTree[newPath] = {
        canMove: true,
        children: [],
        data: currentFolder,
        index: newPath,
        isFolder: true,
        uid: null,
      }
      fileTree[accumulatedPath].children.push(newPath)
    }

    return newPath
  }, root)

  fileTree[currentPath].children.push(node.index)
  fileTree[node.index] = node
}

const retrieveTree = (
  inputFiles: ExtendedFile[],
  assignmentFiles: ExtendedFile[],
  inputRoot: string,
  assignmentRoot: string,
): Record<string, FileNode> => {
  const convertToTree = (
    files: ExtendedFile[],
    root: string,
  ): Record<string, FileNode> => {
    const fileTree: Record<string, FileNode> = {
      [root]: {
        canMove: false,
        children: [],
        data: 'Root item',
        index: root,
        isFolder: true,
        uid: 'root',
      },
    }

    if (files) {
      files.forEach((inputFile) => {
        const { fullPath, name, uid } = inputFile
        const node: FileNode = {
          canMove: true,
          children: [],
          data: name,
          index: fullPath,
          isFolder: name.endsWith('.zip'),
          uid,
        }

        addFoldersToTree(fileTree, fullPath.split('/'), node, root)
      })
    }

    return fileTree
  }

  const inputTree = convertToTree(inputFiles, inputRoot)
  const assignmentTree = convertToTree(assignmentFiles, assignmentRoot)

  return { ...inputTree, ...assignmentTree }
}

export { retrieveTree }
