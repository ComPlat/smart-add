import {
  ExtendedFile,
  ExtendedFolder,
  assignmentsDB,
  filesDB,
} from '@/database/db'
import { createFilePaths } from '@/helper/createFilePaths'
import { FileNode } from '@/helper/types'
import { message } from 'antd'
import { Dispatch, SetStateAction } from 'react'

const uploadFile = async (
  file: ExtendedFile,
  filePaths: {
    name: string
    path: string
    uid: string
  }[],
) => {
  file.fullPath = filePaths.find((path) => path.uid === file.uid)?.path || ''
  await assignmentsDB.assignedFiles.add(file)
  await filesDB.files.where({ uid: file.uid }).delete()
}

const updateAssignedFile = async (
  assigned: ExtendedFile,
  newFullPath: string,
  updateCount: number,
) => {
  const existingFile = await assignmentsDB.assignedFiles.get({
    fullPath: newFullPath,
  })

  if (!existingFile) {
    const updatedFile = { ...assigned, fullPath: newFullPath }
    await assignmentsDB.assignedFiles.put(updatedFile)
    updateCount++
  }

  return updateCount
}

const uploadFolder = async (
  folder: ExtendedFolder,
  filePaths: {
    name: string
    path: string
    uid: string
  }[],
) => {
  folder.fullPath =
    filePaths.find((path) => path.uid === folder.uid)?.path || ''
  await assignmentsDB.assignedFolders.add(folder)
  await filesDB.folders.where({ uid: folder.uid }).delete()
}

const updateAssignedFolder = async (
  assignedFolder: ExtendedFolder,
  newFullPath: string,
  folderUpdateCount: number,
) => {
  const existingFolder = await assignmentsDB.assignedFolders.get({
    fullPath: newFullPath,
  })

  if (!existingFolder) {
    const updatedFolder = { ...assignedFolder, fullPath: newFullPath }
    await assignmentsDB.assignedFolders.put(updatedFolder)
    folderUpdateCount++
  }

  return folderUpdateCount
}

const handleFileMove = async (
  fileTree: Record<string, FileNode>,
  setUploading: Dispatch<SetStateAction<boolean>>,
) => {
  setUploading(true)

  let fileCount = 0
  let updateCount = 0
  let folderCount = 0
  let folderUpdateCount = 0

  const filePaths = createFilePaths(fileTree, 'assignmentTreeRoot')

  const uploadFileTree = async (item: string) => {
    try {
      const file = await filesDB.files.get({ uid: String(fileTree[item].uid) })
      const assigned = await assignmentsDB.assignedFiles.get({
        uid: String(fileTree[item].uid),
      })
      const folder = await filesDB.folders.get({
        uid: String(fileTree[item].uid),
      })
      const assignedFolder = await assignmentsDB.assignedFolders.get({
        uid: String(fileTree[item].uid),
      })

      if (file) {
        await uploadFile(file, filePaths)
        fileCount++
      }

      if (assigned) {
        const newFullPath =
          filePaths.find((path) => path.uid === fileTree[item].uid)?.path || ''
        if (newFullPath !== assigned.fullPath) {
          updateCount = await updateAssignedFile(
            assigned,
            newFullPath,
            updateCount,
          )
        }
      }

      if (folder) {
        await uploadFolder(folder, filePaths)
        folderCount++
      }

      if (assignedFolder) {
        const newFullPath =
          filePaths.find((path) => path.uid === fileTree[item].uid)?.path || ''
        if (newFullPath !== assignedFolder.fullPath) {
          folderUpdateCount = await updateAssignedFolder(
            assignedFolder,
            newFullPath,
            folderUpdateCount,
          )
        }
      }
    } catch (error) {
      console.error(`Error processing file for item: ${fileTree[item].data}`)
      console.error(error)
      message.error(`Error processing file for item: ${fileTree[item].data}`)
    }

    const uploadPromises = fileTree[item].children.map((child) =>
      uploadFileTree(child),
    )
    await Promise.all(uploadPromises)
  }

  const rootFolder = fileTree['assignmentTreeRoot']
  const uploadPromises = rootFolder
    ? rootFolder.children.map((child) => uploadFileTree(child))
    : []
  await Promise.all(uploadPromises)

  if (fileCount > 0) {
    message.info(
      `Moved ${fileCount} file${fileCount > 1 ? 's' : ''} to assignmentDB`,
    )
  }
  if (updateCount > 0) {
    message.info(`${updateCount} entr${updateCount > 1 ? 'ies' : 'y'} updated`)
  }
  if (folderCount > 0) {
    message.info(
      `Moved ${folderCount} folder${
        folderCount > 1 ? 's' : ''
      } to assignmentDB`,
    )
  }
  if (folderUpdateCount > 0) {
    message.info(
      `${folderUpdateCount} folder${
        folderUpdateCount > 1 ? 's' : ''
      } updated in assignmentDB`,
    )
  }

  setUploading(false)
}

export { handleFileMove }
