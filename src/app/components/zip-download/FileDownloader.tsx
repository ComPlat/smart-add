'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { formatDateToTimeStamp } from '@/helper/formatDateToTimeStamp'
import { useLiveQuery } from 'dexie-react-hooks'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { v4 } from 'uuid'
import { Button } from '../workspace/Button'
import { generateExportJson } from './jsonGenerator'
import { dragNotifications } from '@/utils/dragNotifications'

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

  const transformAssignedFilesToHaveUniqueNames = (
    assignedFiles: ExtendedFile[],
  ) => {
    const uniqueAssignedFiles = assignedFiles.map((file) => {
      const splitName = file.name.split('.')
      const extension = splitName.slice(-1)[0]
      const newFilename = `${v4()}${
        extension && splitName.length > 1 ? `.${extension}` : ''
      }`
      return {
        ...file,
        name: newFilename,
      }
    })

    return uniqueAssignedFiles
  }

  const constructTree = (files: ExtendedFile[]): FileTree => {
    return files.reduce((previousTree: FileTree, file: ExtendedFile) => {
      const components = file.fullPath.split('/')

      const componentsTree = components.reduce((previousTree, component) => {
        const value = previousTree[component] ? previousTree[component] : {}
        const componentTreeEntry = { [component]: value }
        return Object.assign(previousTree, componentTreeEntry)
      }, {} as FileTree)

      const fileTree = { [file.name]: file.file }

      return Object.assign(previousTree, componentsTree, fileTree)
    }, {} as FileTree)
  }

  const handleClick = async () => {
    try {
      const zip = new JSZip()
      const transformedAssignedFiles =
        transformAssignedFilesToHaveUniqueNames(assignedFiles)
      const fileTree = constructTree(transformedAssignedFiles)

      const addFilesToZip = async (tree: FileTree, parentZip: JSZip = zip) => {
        await Promise.all(
          Object.entries(tree).map(async ([name, value]) => {
            const newPath = `attachments/${name}`

            if (
              name.endsWith('.zip') &&
              typeof value === 'object' &&
              !(value instanceof Blob)
            ) {
              const nestedZip = new JSZip()
              await addFilesToZip(value as FileTree, nestedZip)
              const nestedBlob = await nestedZip.generateAsync({ type: 'blob' })
              parentZip.file(newPath, nestedBlob)
            } else if (value instanceof Blob) {
              parentZip.file(newPath, value)
            } else if (typeof value === 'object') {
              await addFilesToZip(value as FileTree, parentZip)
            }
          }),
        )

        return parentZip
      }

      await addFilesToZip(fileTree)

      const exportJsonData = await generateExportJson(
        transformedAssignedFiles,
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

      const exportedZipFileName = `export_${formatDateToTimeStamp(new Date())}`

      saveAs(blob, exportedZipFileName)
      dragNotifications.showSuccess(`${exportedZipFileName} downloaded successfully`)
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
