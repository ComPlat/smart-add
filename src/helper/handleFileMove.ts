import {
  ExtendedFile,
  ExtendedFolder,
  assignmentsDB,
  filesDB,
} from '@/database/db'
import { createFilePaths } from '@/helper/createFilePaths'
import { FileNode } from '@/helper/types'
import { message } from 'antd'
import { Table } from 'dexie'
import { Dispatch, SetStateAction } from 'react'

const uploadFile = async (
  file: ExtendedFile,
  filePaths: {
    name: string
    path: string
    uid: string
  }[],
): Promise<[number, number]> => {
  file.fullPath = filePaths.find((path) => path.uid === file.uid)?.path || ''
  return Promise.all([
    assignmentsDB.assignedFiles.add(file),
    filesDB.files.where({ uid: file.uid }).delete(),
  ])
}

const updateAssignedFile = async (
  assigned: ExtendedFile,
  newFullPath: string,
  updateCount: number,
): Promise<number> => {
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
): Promise<[number, number]> => {
  folder.fullPath =
    filePaths.find((path) => path.uid === folder.uid)?.path || ''
  return Promise.all([
    assignmentsDB.assignedFolders.add(folder),
    filesDB.folders.where({ uid: folder.uid }).delete(),
  ])
}

const updateAssignedFolder = async (
  assignedFolder: ExtendedFolder,
  newFullPath: string,
  folderUpdateCount: number,
): Promise<number> => {
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

  const uploadFileTree = async (item: string): Promise<void> => {
    interface Result {
      result: ExtendedFile | ExtendedFolder
    }

    interface FunctionTable {
      assigned: (result: Result) => Promise<void>
      assignedFolder: (result: Result) => Promise<void>
      file: (result: Result) => Promise<void>
      folder: (result: Result) => Promise<void>
    }

    const idToFunctionTable: FunctionTable = {
      assigned: async (result) => {
        const assigned = result.result as ExtendedFile
        const newFullPathFile =
          filePaths.find((path) => path.uid === fileTree[item].uid)?.path || ''
        if (newFullPathFile !== assigned.fullPath) {
          updateCount = await updateAssignedFile(
            assigned,
            newFullPathFile,
            updateCount,
          )
        }
      },
      assignedFolder: async (result) => {
        const assignedFolder = result.result as ExtendedFolder
        const newFullPathFolder =
          filePaths.find((path) => path.uid === fileTree[item].uid)?.path || ''
        if (newFullPathFolder !== assignedFolder.fullPath) {
          folderUpdateCount = await updateAssignedFolder(
            assignedFolder,
            newFullPathFolder,
            folderUpdateCount,
          )
        }
      },
      file: async (result) => {
        fileCount++
        await uploadFile(result.result as ExtendedFile, filePaths)
      },
      folder: async (result) => {
        folderCount++
        await uploadFolder(result.result as ExtendedFolder, filePaths)
      },
    }

    const createPromise = (
      db: Table<ExtendedFile | ExtendedFolder>,
      id: keyof FunctionTable,
      uid: string,
    ) =>
      db
        .get({ uid })
        .then((result) => (result ? { id, result } : Promise.reject()))

    try {
      const uid = String(fileTree[item].uid)

      const promises = [
        createPromise(filesDB.files, 'file', uid),
        createPromise(assignmentsDB.assignedFiles, 'assigned', uid),
        createPromise(filesDB.folders, 'folder', uid),
        createPromise(assignmentsDB.assignedFolders, 'assignedFolder', uid),
      ]

      const result = await Promise.any(promises)

      await idToFunctionTable[result.id](result)
    } catch (error) {
      console.error('All promises were rejected', error)
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
