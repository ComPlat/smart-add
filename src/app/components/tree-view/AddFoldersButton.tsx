import { assignmentsDB } from '@/database/db'
import { FileNode } from '@/helper/types'
import { Button } from 'antd'
import { v4 } from 'uuid'

const clickHandler = async (tree: Record<string, FileNode>) => {
  const baseFolderName1 = 'Samples'
  let folderName1 = baseFolderName1
  let counter1 = 1

  while (tree[folderName1]) {
    folderName1 = `${baseFolderName1}_${counter1}`
    counter1++
  }
  const newFolderNode1 = {
    canMove: true,
    canRename: true,
    children: [],
    data: folderName1,
    index: folderName1,
    isFolder: true,
    uid: v4(),
  }

  const baseFolderName2 = 'Reactions'
  let folderName2 = baseFolderName2
  let counter2 = 1

  while (tree[folderName2]) {
    folderName2 = `${baseFolderName2}_${counter2}`
    counter2++
  }

  const newFolderNode2 = {
    canMove: true,
    canRename: true,
    children: [],
    data: folderName2,
    index: folderName2,
    isFolder: true,
    uid: v4(),
  }

  const baseFolderName3 = 'Analyses'
  let folderName3 = baseFolderName3
  let counter3 = 1

  while (tree[folderName3]) {
    folderName3 = `${baseFolderName3}_${counter3}`
    counter3++
  }

  const newFolderNode3 = {
    canMove: true,
    canRename: true,
    children: [],
    data: folderName3,
    index: folderName3,
    isFolder: true,
    uid: v4(),
  }

  await Promise.all([
    assignmentsDB.assignedFolders.add({
      // extension: 'folder',
      // file: new File([''], newFolderNode1.data),
      fullPath: newFolderNode1.index,
      isFolder: true,
      name: newFolderNode1.data,
      parentUid: v4(),
      // path: [],
      uid: newFolderNode1.uid,
    }),
    assignmentsDB.assignedFolders.add({
      // extension: 'folder',
      // file: new File([''], newFolderNode2.data),
      fullPath: newFolderNode2.index,
      isFolder: true,
      name: newFolderNode2.data,
      parentUid: v4(),
      // path: [],
      uid: newFolderNode2.uid,
    }),
    assignmentsDB.assignedFolders.add({
      // extension: 'folder',
      // file: new File([''], newFolderNode3.data),
      fullPath: newFolderNode3.index,
      isFolder: true,
      name: newFolderNode3.data,
      parentUid: v4(),
      // path: [],
      uid: newFolderNode3.uid,
    }),
  ])
}

const AddFoldersButton = ({ tree }: { tree: Record<string, FileNode> }) => (
  <Button onClick={() => clickHandler(tree)}>Add Folders</Button>
)

export { AddFoldersButton }
