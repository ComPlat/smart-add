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
  let currentPath = 'root'
  let currentFolder = fileTree[currentPath]

  for (const folder of path) {
    currentPath = currentPath === 'root' ? folder : `${currentPath}/${folder}`

    if (!fileTree[currentPath]) {
      // HINT: Create create folders for file when they don't exist already
      fileTree[currentPath] = {
        canMove: true,
        children: [],
        data: folder,
        index: currentPath,
        isFolder: true,
      }
      currentFolder.children.push(currentPath)
    }
    currentFolder = fileTree[currentPath]
  }

  currentFolder.children.push(node.index)
  fileTree[node.index] = node
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
      root2: {
        canMove: false,
        children: [],
        data: 'Root item 2',
        index: 'root2',
        isFolder: true,
      },
    }

    inputFiles.forEach((inputFile) => {
      const { fullPath, name } = inputFile
      const node: FileNode = {
        canMove: true,
        children: [],
        data: name,
        index: fullPath,
        isFolder: name.endsWith('.zip'),
      }

      addFoldersToTree(fileTree, fullPath.split('/'), node)
    })

    return fileTree
  }

  return convertToTree(files)
}

export { constructTree }
