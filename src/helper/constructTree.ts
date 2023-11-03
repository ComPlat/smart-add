import { ExtendedFile } from '@/database/db'

interface FileNode {
  canMove: boolean
  children: string[]
  data: string
  index: string
  isFolder: boolean
}

const addFoldersToTree = (
  fileTree: Record<string, FileNode>,
  path: string[],
  node: FileNode,
): void => {
  if (path.length === 0) {
    fileTree['root'].children.push(node.index)
    return
  }

  let currentPath = 'root'
  path.forEach((folder) => {
    const previousPath = currentPath
    // HINT: Go deeper into folder structure every iteration.
    currentPath += `${folder}/`

    if (!fileTree[currentPath]) {
      // HINT: Create create folders for file when they don't exist already
      fileTree[currentPath] = {
        canMove: false,
        children: [],
        data: folder,
        index: currentPath,
        isFolder: true,
      }
      // HINT: make folder for file child of parent folder
      fileTree[previousPath].children.push(currentPath)
    }
  })

  // HINT: make file child of folder for file
  fileTree[currentPath].children.push(node.index)
}

const constructTree = (files: ExtendedFile[]): Record<string, FileNode> => {
  const convertToTree = (
    inputFiles: ExtendedFile[],
  ): Record<string, FileNode> => {
    const fileTree: Record<string, FileNode> = {
      // HINT: Root is ALWAYS needed.
      root: {
        canMove: false,
        children: [],
        data: 'Root item',
        index: 'root',
        isFolder: true,
      },
    }

    inputFiles.forEach((inputFile) => {
      const { fullPath, name, path } = inputFile
      const node: FileNode = {
        canMove: false,
        data: name,
        index: fullPath,
        isFolder: false,
      } as FileNode
      addFoldersToTree(fileTree, path, node)
      fileTree[node.index] = node
    })

    return fileTree
  }

  return convertToTree(files)
}

export { constructTree }
