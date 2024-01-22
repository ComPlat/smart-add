import { ExtendedFile, ExtendedFolder } from '@/database/db'

export const getTotalLength = (
  files: ExtendedFile[],
  folders: ExtendedFolder[],
  treeRoot: string,
) => {
  const fileFilter = files.filter((file) => file.treeId === treeRoot)
  const folderFilter = folders.filter((folder) => folder.treeId === treeRoot)
  return fileFilter.length + folderFilter.length
}
