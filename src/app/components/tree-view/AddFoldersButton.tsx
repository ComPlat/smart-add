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

const folderNames = ['Samples', 'Reactions', 'Analyses']

const createFolderNode = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
): Promise<number> => {
  const uniqueFolderName = generateUniqueFolderName(baseFolderName, tree)

  return await assignmentsDB.assignedFolders.add({
    fullPath: uniqueFolderName,
    isFolder: true,
    name: uniqueFolderName,
    parentUid: v4(),
    uid: v4(),
  })
}

const clickHandler = async (
  tree: Record<string, FileNode>,
): Promise<number[]> =>
  await Promise.all(
    folderNames.map((folderName) => createFolderNode(folderName, tree)),
  )

const AddFoldersButton = ({ tree }: { tree: Record<string, FileNode> }) => (
  <Button onClick={() => clickHandler(tree)}>Add Folders</Button>
)

export { AddFoldersButton }
