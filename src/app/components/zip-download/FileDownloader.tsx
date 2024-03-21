'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { v4 } from 'uuid'

import { Button } from '../workspace/Button'
import { generateExportJson } from './jsonGenerator'

interface FileTree {
  [key: string]: Blob | FileTree
}

const FileDownloader = () => {
  const assignedFiles =
    useLiveQuery(() =>
      filesDB.files.where('treeId').equals('assignmentTreeRoot').toArray(),
    ) || []
  const assignedFolders =
    useLiveQuery(() =>
      filesDB.folders.where('treeId').equals('assignmentTreeRoot').toArray(),
    ) || []

  const constructTree = (files: ExtendedFile[]): FileTree =>
    files.reduce((fileTree, file) => {
      const pathComponents: string[] = file.fullPath.split('/')
      pathComponents.reduce(
        (level: FileTree, component: string, index: number) => {
          if (!level[component]) {
            level[component] = {}
          }
          if (index === pathComponents.length - 1) {
            level[component] = file.file
          }
          return level[component] as FileTree
        },
        fileTree,
      )

      return fileTree
    }, {} as FileTree)

  const handleClick = async () => {
    try {
      const zip = new JSZip()
      const fileTree = constructTree(assignedFiles)

      const addFilesToZip = async (tree: FileTree, parentZip: JSZip = zip) => {
        await Promise.all(
          Object.entries(tree).map(async ([name, value]) => {
            const extension = name.split('.').pop() // Get the file extension
            const newFilename = `${v4()}.${extension}`

            const newPath = `attachments/${newFilename}`

            if (name.endsWith('.zip') && typeof value === 'object') {
              const nestedZip = new JSZip()
              await addFilesToZip(value, nestedZip)
              const nestedBlob = await nestedZip.generateAsync({ type: 'blob' })
              parentZip.file(newPath, nestedBlob)
            } else if (value instanceof Blob) {
              parentZip.file(newPath, value)
            } else {
              await addFilesToZip(value, parentZip)
            }
          }),
        )

        return parentZip
      }

      await addFilesToZip(fileTree)

      const exportJsonData = await generateExportJson(
        assignedFiles,
        assignedFolders,
      )
      const exportJson = new File(
        [JSON.stringify(exportJsonData)],
        'export.json',
        {
          lastModified: Date.now(),
          type: 'application/json',
        },
      )
      zip.file('export.json', exportJson)

      const blob = await zip.generateAsync({ type: 'blob' })

      saveAs(blob, 'exportZip')
      message.success('exportZip.zip downloaded successfully')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Button
      disabled={assignedFiles.length === 0}
      label="Download as ZIP"
      onClick={handleClick}
      variant="primary"
    />
  )
}

export { FileDownloader }
