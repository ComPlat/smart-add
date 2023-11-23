import { assignmentsDB, filesDB } from '@/database/db'
import { createFilePaths } from '@/helper/createFilePaths'
import { FileNode } from '@/helper/types'
import { message } from 'antd'
import { Dispatch, SetStateAction } from 'react'

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
      const file = await filesDB.files.get({
        uid: String(fileTree[item].uid),
      })
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
        file.fullPath =
          filePaths.find((path) => path.uid === fileTree[item].uid)?.path || ''
        await assignmentsDB.assignedFiles.add(file)
        await filesDB.files.where({ uid: file.uid }).delete()

        fileCount++
      }

      if (assigned) {
        const newFullPath =
          filePaths.find((path) => path.uid === fileTree[item].uid)?.path || ''
        if (newFullPath !== assigned.fullPath) {
          const existingFile = await assignmentsDB.assignedFiles.get({
            fullPath: newFullPath,
          })

          if (existingFile) return

          const updatedFile = {
            ...assigned,
            fullPath: newFullPath,
          }

          if (newFullPath !== assigned.fullPath) {
            await assignmentsDB.assignedFiles.put(updatedFile)
            updateCount++
          }
        }
      }
      if (folder) {
        folder.fullPath =
          filePaths.find((path) => path.uid === fileTree[item].uid)?.path || ''
        await assignmentsDB.assignedFolders.add(folder)
        await filesDB.folders.where({ uid: folder.uid }).delete()

        folderCount++
      }

      if (assignedFolder) {
        const newFullPath =
          filePaths.find((path) => path.uid === fileTree[item].uid)?.path || ''
        if (newFullPath !== assignedFolder.fullPath) {
          const existingFolder = await assignmentsDB.assignedFolders.get({
            fullPath: newFullPath,
          })

          if (existingFolder) return

          const updatedFolder = {
            ...assignedFolder,
            fullPath: newFullPath,
          }

          if (newFullPath !== assignedFolder.fullPath) {
            await assignmentsDB.assignedFolders.put(updatedFolder)
            folderUpdateCount++
          }
        }
      }
    } catch (error) {
      console.error(`Error processing file for item: ${fileTree[item].data}`)
      console.error(error)
      message.error(`Error processing file for item: ${fileTree[item].data}`)
    }

    if (fileTree[item].children) {
      for (const child of fileTree[item].children) {
        await uploadFileTree(child)
      }
    }
  }

  const rootFolder = fileTree['assignmentTreeRoot']
  if (rootFolder) {
    for (const itemName of rootFolder.children) {
      await uploadFileTree(itemName)
    }
  }

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
