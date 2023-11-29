import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'

const convertToFileTree = (
  fileTree: Record<string, FileNode>,
  folderMap: { [key: string]: TempFileNode },
  folderDepthMap: { [key: number]: string[] },
  noFolderFiles: ExtendedFile[],
): void => {
  noFolderFiles.forEach((file) => {
    fileTree[file.fullPath] = {
      canMove: true,
      children: [],
      data: file.name,
      index: file.fullPath,
      isFolder: false,
      uid: file.uid,
    }
  })

  for (let i = 0; i < Object.keys(folderDepthMap).length; i++) {
    if (!folderDepthMap[i]) continue

    folderDepthMap[i].forEach((folder) => {
      const currentFolder = folderMap[folder]

      fileTree[currentFolder.folderObj.fullPath] = {
        canMove: true,
        children: Object.keys(currentFolder.children),
        data: currentFolder.folderObj.name,
        index: currentFolder.folderObj.fullPath,
        isFolder: true,
        uid: currentFolder.folderObj.uid,
      }

      Object.values(currentFolder.children).forEach((child) => {
        if ('extension' in child) {
          fileTree[child.fullPath] = {
            canMove: true,
            children: [],
            data: child.name,
            index: child.fullPath,
            isFolder: false,
            uid: child.uid,
          }
        }
      })
    })
  }
}

interface TempFileNode {
  children: { [key: string]: ExtendedFile | ExtendedFolder | TempFileNode }
  folderObj: ExtendedFolder
}

const retrieveTree = (
  inputFiles: ExtendedFile[],
  inputFolders: ExtendedFolder[],
  inputRoot: string,
  assignmentFiles: ExtendedFile[],
  assignmentFolders: ExtendedFolder[],
  assignmentRoot: string,
): Record<string, FileNode> => {
  const convertToTree = (
    files: ExtendedFile[],
    folders: ExtendedFolder[],
    root: string,
  ): Record<string, FileNode> => {
    const folderMap: { [key: string]: TempFileNode } = {}
    const noFolderFiles: ExtendedFile[] = []

    folders.forEach((folder) => {
      folderMap[folder.fullPath] = {
        children: {},
        folderObj: folder,
      }
    })

    const folderDepthMap: { [key: number]: string[] } = {}
    Object.keys(folderMap).forEach((key) => {
      const depth = key.split('/').length - 1
      folderDepthMap[depth] = folderDepthMap[depth]
        ? [...folderDepthMap[depth], key]
        : [key]
    })

    files.forEach((file) => {
      const folderPath = file.fullPath.split('/').slice(0, -1).join('/')
      if (!folderMap[folderPath]) {
        noFolderFiles.push(file)
      } else {
        folderMap[folderPath].children[file.fullPath] = file
      }
    })

    const maxDepth = Object.keys(folderDepthMap).length
    const rootItems = folderDepthMap[0] || []

    for (let i = 0; i < maxDepth - 1; i++) {
      if (!folderDepthMap[i]) break
      for (const folder of folderDepthMap[i]) {
        if (folderDepthMap[i + 1]) {
          const children = folderDepthMap[i + 1].filter((child) =>
            child.startsWith(folder),
          )
          children.forEach((child) => {
            folderMap[folder].children[child] = folderMap[child]
          })
        }
      }
    }

    const fileTree: Record<string, FileNode> = {
      [root]: {
        canMove: false,
        children: [...rootItems, ...noFolderFiles.map((file) => file.fullPath)],
        data: 'Root item',
        index: root,
        isFolder: true,
        uid: 'root',
      },
    }

    convertToFileTree(fileTree, folderMap, folderDepthMap, noFolderFiles)

    return fileTree
  }

  const inputTree = convertToTree(inputFiles, inputFolders, inputRoot)
  const assignmentTree = convertToTree(
    assignmentFiles,
    assignmentFolders,
    assignmentRoot,
  )

  return { ...inputTree, ...assignmentTree }
}

export { retrieveTree }
