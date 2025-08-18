import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode, FolderDepthMap } from '@/helper/types'

const convertToFileTree = (
  fileTree: Record<string, FileNode>,
  folderMap: { [key: string]: TempFileNode },
  folderDepthMap: { [key: number]: string[] },
  noFolderFiles: ExtendedFile[],
): Record<string, FileNode> => {
  const noFolderFilesNodes = noFolderFiles.reduce(
    (acc, file) => ({
      ...acc,
      [file.fullPath]: {
        canMove: true,
        children: [],
        data: 'name' in file.file ? file.file.name : 'unknown',
        index: file.fullPath,
        isFolder: false,
        uid: file.uid,
      },
    }),
    {},
  )

  const folderDepthMapNodes = Object.keys(folderDepthMap)
    .flatMap((key) => {
      const folders = folderDepthMap[Number(key)]
      if (!folders) return []

      return folders.flatMap((folder) => {
        const currentFolder = folderMap[folder]
        const folderNode = {
          canMove: true,
          children: Object.keys(currentFolder.children),
          data: currentFolder.folderObj.name,
          index: currentFolder.folderObj.fullPath,
          isFolder: true,
          uid: currentFolder.folderObj.uid,
        }

        const childNodes: Record<string, FileNode>[] = Object.values(
          currentFolder.children,
        ).flatMap((child) =>
          'extension' in child
            ? [
                {
                  [child.fullPath]: {
                    canMove: true,
                    children: [],
                    data: child.name,
                    index: child.fullPath,
                    isFolder: false,
                    uid: child.uid,
                  },
                },
              ]
            : [],
        )

        return [
          { [currentFolder.folderObj.fullPath]: folderNode },
          ...childNodes,
        ]
      })
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {})

  return Object.assign({}, fileTree, noFolderFilesNodes, folderDepthMapNodes)
}

interface TempFileNode {
  children: { [key: string]: ExtendedFile | ExtendedFolder | TempFileNode }
  folderObj: ExtendedFolder
}

const retrieveTree = (
  inputFiles: ExtendedFile[],
  inputFolders: ExtendedFolder[],
  treeId: string,
): Record<string, FileNode> => {
  const convertToTree = (
    files: ExtendedFile[],
    folders: ExtendedFolder[],
    root: string,
  ): Record<string, FileNode> => {
    const folderMap: Record<string, TempFileNode> = folders.reduce(
      (acc, folder) => ({
        ...acc,
        [folder.fullPath]: {
          children: {},
          folderObj: folder,
        },
      }),
      {},
    )

    const folderDepthMap: FolderDepthMap = Object.keys(folderMap).reduce(
      (acc, key) => {
        const depth = key.split('/').length - 1
        acc[depth] = acc[depth] ? [...acc[depth], key] : [key]
        return acc
      },
      {} as FolderDepthMap,
    )

    const noFolderFiles: ExtendedFile[] = files.reduce((acc, file) => {
      const folderPath = file.fullPath.split('/').slice(0, -1).join('/')
      if (!folderMap[folderPath]) {
        return [...acc, file]
      } else {
        folderMap[folderPath].children[file.fullPath] = file
      }
      return acc
    }, [] as ExtendedFile[])

    const updatedFolderMap: Record<string, TempFileNode> = Object.keys(
      folderDepthMap,
    ).reduce((acc, key) => {
      const currentDepth = +key
      const nextDepth = currentDepth + 1

      if (!folderDepthMap[currentDepth] || !folderDepthMap[nextDepth])
        return acc

      return folderDepthMap[currentDepth].reduce((acc, folder) => {
        const folderSegments = folder.split('/')
        const children = folderDepthMap[nextDepth].filter((child) => {
          const childSegments = child.split('/')
          return (
            childSegments.length === folderSegments.length + 1 &&
            folderSegments.every(
              (segment, index) => segment === childSegments[index],
            )
          )
        })
        const updatedChildren = children.reduce(
          (childAcc, child) => ({
            ...childAcc,
            [child]: folderMap[child],
          }),
          {},
        )

        return {
          ...acc,
          [folder]: {
            ...acc[folder],
            children: {
              ...acc[folder].children,
              ...updatedChildren,
            },
          },
        }
      }, acc)
    }, folderMap)

    const rootItems = folderDepthMap[0] || []
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

    return convertToFileTree(
      fileTree,
      updatedFolderMap,
      folderDepthMap,
      noFolderFiles,
    )
  }

  const filteredFiles = inputFiles.filter((file) => file.treeId === treeId)
  const filteredFolders = inputFolders.filter(
    (folder) => folder.treeId === treeId,
  )

  const tree = convertToTree(filteredFiles, filteredFolders, treeId)
  return tree
}

export { retrieveTree }
