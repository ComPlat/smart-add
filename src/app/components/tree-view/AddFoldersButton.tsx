import { assignmentsDB } from '@/database/db'
import { FileNode } from '@/helper/types'
import { Button } from 'antd'
import { v4 } from 'uuid'

const generateUniqueFolderName = (
  baseFolderName: string,
  tree: Record<string, FileNode>,
  counter = 0,
): string => {
  const folderName =
    counter === 0 ? baseFolderName : `${baseFolderName}_${counter}`

  return tree[folderName]
    ? generateUniqueFolderName(baseFolderName, tree, counter + 1)
    : folderName
}

const clickHandler = async (tree: Record<string, FileNode>) => {
  const uniqueFolderName1 = generateUniqueFolderName('Samples', tree)

  const newFolderNode1 = {
    canMove: true,
    canRename: true,
    children: [],
    data: uniqueFolderName1,
    index: uniqueFolderName1,
    isFolder: true,
    uid: v4(),
  }

  const uniqueFolderName2 = generateUniqueFolderName('Reactions', tree)

  const newFolderNode2 = {
    canMove: true,
    canRename: true,
    children: [],
    data: uniqueFolderName2,
    index: uniqueFolderName2,
    isFolder: true,
    uid: v4(),
  }

  const uniqueFolderName3 = generateUniqueFolderName('Analyses', tree)

  const newFolderNode3 = {
    canMove: true,
    canRename: true,
    children: [],
    data: uniqueFolderName3,
    index: uniqueFolderName3,
    isFolder: true,
    uid: v4(),
  }

  await Promise.all([
    assignmentsDB.assignedFolders.add({
      fullPath: newFolderNode1.index,
      isFolder: true,
      name: newFolderNode1.data,
      parentUid: v4(),
      uid: newFolderNode1.uid,
    }),
    assignmentsDB.assignedFolders.add({
      fullPath: newFolderNode2.index,
      isFolder: true,
      name: newFolderNode2.data,
      parentUid: v4(),
      uid: newFolderNode2.uid,
    }),
    assignmentsDB.assignedFolders.add({
      fullPath: newFolderNode3.index,
      isFolder: true,
      name: newFolderNode3.data,
      parentUid: v4(),
      uid: newFolderNode3.uid,
    }),
  ])
}

const AddFoldersButton = ({ tree }: { tree: Record<string, FileNode> }) => (
  <Button onClick={() => clickHandler(tree)}>Add Folders</Button>
)

export { AddFoldersButton }
