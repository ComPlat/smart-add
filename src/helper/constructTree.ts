import { ExtendedFile } from '@/database/db'
import { FileNode } from '@/helper/types'

const addFoldersToTree = (
  fileTree: Record<string, FileNode>,
  path: string[],
  node: FileNode,
  root: string,
): void => {
  let currentPath = root
  let currentFolder = fileTree[currentPath]

  for (const folder of path) {
    currentPath = currentPath === root ? folder : `${currentPath}/${folder}`

    if (!fileTree[currentPath]) {
      fileTree[currentPath] = {
        canMove: true,
        children: [],
        data: folder,
        index: currentPath,
        isFolder: true,
        uid: null,
      }
      currentFolder.children.push(currentPath)
    }
    currentFolder = fileTree[currentPath]
  }

  currentFolder.children.push(node.index)
  fileTree[node.index] = node
}

const constructTree = (
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

    return fileTree
  }

  const inputTree = convertToTree(inputFiles, inputRoot)
  const assignmentTree = convertToTree(assignmentFiles || [], assignmentRoot)

  return { ...inputTree, ...assignmentTree }
}

export { constructTree }
