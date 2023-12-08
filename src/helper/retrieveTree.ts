import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode, FolderDepthMap } from '@/helper/types'

const convertToFileTree = (
  fileTree: Record<string, FileNode>,
  folderMap: { [key: string]: TempFileNode },
  folderDepthMap: { [key: number]: string[] },
  noFolderFiles: ExtendedFile[],
): Record<string, FileNode> => {
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

  Object.keys(folderDepthMap).forEach((key) => {
    if (!folderDepthMap[Number(key)]) return

    folderDepthMap[Number(key)].forEach((folder: string) => {
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
  })

  return fileTree
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

    const folderDepthMap: FolderDepthMap = Object.keys(folderMap).reduce(
      (acc: FolderDepthMap, key: string) => {
        const depth = key.split('/').length - 1
        acc[depth] = acc[depth] ? [...acc[depth], key] : [key]
        return acc
      },
      {},
    )

    files.forEach((file) => {
      const folderPath = file.fullPath.split('/').slice(0, -1).join('/')
      if (!folderMap[folderPath]) {
        noFolderFiles.push(file)
      } else {
        folderMap[folderPath].children[file.fullPath] = file
      }
    })

    const rootItems = folderDepthMap[0] || []

    Object.keys(folderDepthMap).forEach((key) => {
      const currentDepth = +key
      const nextDepth = currentDepth + 1

      if (!folderDepthMap[currentDepth] || !folderDepthMap[nextDepth]) return

      folderDepthMap[currentDepth].forEach((folder: string) => {
        const children = folderDepthMap[nextDepth].filter((child: string) =>
          child.startsWith(folder),
        )

        children.forEach((child: string) => {
          folderMap[folder].children[child] = folderMap[child]
        })
      })
    })

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

    return convertToFileTree(fileTree, folderMap, folderDepthMap, noFolderFiles)
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
