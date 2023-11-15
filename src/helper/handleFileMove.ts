import { assignmentsDB, filesDB } from '@/database/db'
import { createFilePaths } from '@/helper/constructPaths'
import { FileNode } from '@/helper/types'
import { message } from 'antd'
import { Dispatch, SetStateAction } from 'react'

const handleFileMove = async (
  fileTree: Record<string, FileNode>,
  setUploading: Dispatch<SetStateAction<boolean>>,
) => {
  setUploading(true)

  let fileCount = 0

  const filePaths = createFilePaths(fileTree, 'assignmentTreeRoot')

  const uploadFileTree = async (item: string) => {
    try {
      const file = await filesDB.files.get({
        uid: String(fileTree[item].uid),
      })
      const assigned = await assignmentsDB.assignedFiles.get({
        uid: String(fileTree[item].uid),
      })
      if (file) {
        file.fullPath =
          filePaths.find((path) => path.name === fileTree[item].data)?.path ||
          ''
        await assignmentsDB.assignedFiles.add(file)

        await filesDB.files.where({ uid: file.uid }).delete()

        fileCount++
      }
      if (assigned) {
        const newPath =
          filePaths.find((path) => path.name === fileTree[item].data)?.path ||
          ''
        const updatedFile = {
          ...assigned,
          fullPath: newPath,
        }
        await assignmentsDB.assignedFiles.put(updatedFile)
        fileCount++
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
    message.success(
      `Moved ${fileCount} file${fileCount > 1 ? 's' : ''} to assignmentDB`,
    )
  }

  setUploading(false)
}

export { handleFileMove }
