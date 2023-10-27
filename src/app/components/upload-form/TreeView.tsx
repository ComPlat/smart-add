/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree'
import 'react-complex-tree/lib/style-modern.css'

const constructTree = (files: ExtendedFile[]): Record<string, any> => {
  interface FileNode {
    canMove: boolean
    children?: string[]
    data?: string
    index: string
    isFolder: boolean
  }

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

    const addFoldersToTree = (path: string[], node: FileNode) => {
      if (path.length === 0) {
        fileTree['root'].children?.push(node.index)
      } else {
        let currentPath = ''
        path.forEach((folder) => {
          const previousPath = currentPath
          currentPath += `${folder}/`
          // HINT: Go deeper into folder structure every iteration.

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
            fileTree[previousPath ? previousPath : 'root'].children?.push(
              currentPath,
            )
          }
        })

        // HINT: make file child of folder for file
        fileTree[currentPath].children?.push(node.index)
      }
    }

    inputFiles.forEach((inputFile) => {
      const { fullPath, name, path } = inputFile
      const node: FileNode = {
        canMove: false,
        data: name,
        index: fullPath,
        isFolder: false,
      }
      addFoldersToTree(path, node)
      fileTree[node.index] = node
    })

    return fileTree
  }

  const outputTree = convertToTree(files)

  return outputTree
}

const TreeView = () => {
  const files = useLiveQuery(() => filesDB.files.toArray(), [])

  if (!files) {
    return <div>Loading...</div>
  }

  const fileTree = constructTree(files)

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(fileTree, (item, data) => ({
          ...item,
          data,
        }))
      }
      canDragAndDrop
      canDropOnFolder
      canDropOnNonFolder
      canReorderItems
      getItemTitle={(item) => item.data}
      key={files.length}
      viewState={{}}
    >
      <Tree rootItem="root" treeId="tree-1" treeLabel="Tree Example" />
    </UncontrolledTreeEnvironment>
  )
}

export { TreeView }
