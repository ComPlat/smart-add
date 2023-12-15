import { ExtendedFolder, assignmentsDB } from '@/database/db'
import { FileNode } from '@/helper/types'

const collectItemsToDelete = (
  node: FileNode,
  tree: Record<string, FileNode>,
) => {
  let itemsToDelete: string[] = []

  if (node.children) {
    node.children.forEach((child: string) => {
      itemsToDelete = [
        ...itemsToDelete,
        ...collectItemsToDelete(tree[child], tree),
      ]
    })
  }

  itemsToDelete.push(node.index)
  return itemsToDelete
}

const deleteFolder = async (
  folder: ExtendedFolder,
  tree: Record<string, FileNode>,
) => {
  if (!('id' in folder)) {
    throw new TypeError('Can not delete because the folder is missing an id!')
  }

  if (!(typeof folder.id === 'number')) {
    throw new TypeError(
      'Can not delete because the id of folder is not a number!',
    )
  }

  const itemsToDelete = collectItemsToDelete(tree[folder.fullPath], tree)

  await Promise.all(
    itemsToDelete.flatMap((id) => [
      assignmentsDB.assignedFolders.where('fullPath').equals(id).delete(),
      assignmentsDB.assignedFiles.where('fullPath').equals(id).delete(),
    ]),
  )

  await assignmentsDB.assignedFolders.delete(folder.id)
}

export default deleteFolder
