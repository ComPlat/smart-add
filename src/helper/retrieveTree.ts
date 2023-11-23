import { ExtendedFile, ExtendedFolder } from '@/database/db'
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
  inputFolders: ExtendedFolder[],
  assignmentFiles: ExtendedFile[],
  assignmentFolders: ExtendedFolder[],
  inputRoot: string,
  assignmentRoot: string,
): Record<string, FileNode> => {
  const convertToTree = (
    files: ExtendedFile[],
    folders: ExtendedFolder[],
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

    folders.forEach((folder) => {
      const { fullPath, name, uid } = folder
      const node: FileNode = {
        canMove: true,
        children: [],
        data: name,
        index: fullPath,
        isFolder: true,
        uid,
      }

      addFoldersToTree(fileTree, fullPath.split('/'), node, root)
    })

    files.forEach((inputFile) => {
      const { fullPath, isFolder, name, uid } = inputFile
      const node: FileNode = {
        canMove: true,
        children: [],
        data: name,
        index: fullPath,
        isFolder,
        uid,
      }

      addFoldersToTree(fileTree, fullPath.split('/'), node, root)
    })

    return fileTree
  }

  const inputTree = convertToTree(inputFiles, inputFolders, inputRoot)
  const assignmentTree = convertToTree(
    assignmentFiles,
    assignmentFolders,
    assignmentRoot,
  )

  console.log(inputTree)
  return { ...inputTree, ...assignmentTree }
}

export { retrieveTree }
