'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { v4 } from 'uuid'
import { Button } from '../workspace/Button'
import { generateExportJson } from './jsonGenerator'
import { dragNotifications } from '@/utils/dragNotifications'

const zipDate = new Date().toLocaleDateString().replace(/\//g, '-')

const FileDownloader = () => {
  const assignedFiles =
    useLiveQuery(() =>
      filesDB.files.where('treeId').equals('assignmentTreeRoot').toArray(),
    ) || []
  const assignedFolders =
    useLiveQuery(() =>
      filesDB.folders.where('treeId').equals('assignmentTreeRoot').toArray(),
    ) || []

  interface CategorizedFiles {
    directFiles: ExtendedFile[]
    folderGroups: Record<string, ExtendedFile[]>
  }

  const categorizeFiles = (assignedFiles: ExtendedFile[]): CategorizedFiles => {
    const directFiles: ExtendedFile[] = []
    const folderGroups: Record<string, ExtendedFile[]> = {}

    assignedFiles.forEach((file) => {
      const pathParts = file.fullPath.split('/')
      const datasetIndex = pathParts.findIndex((part) => {
        const folder = assignedFolders.find(
          (f) =>
            f.fullPath ===
            pathParts.slice(0, pathParts.indexOf(part) + 1).join('/'),
        )
        return folder?.dtype === 'dataset'
      })

      if (datasetIndex !== -1) {
        const afterDataset = pathParts.slice(datasetIndex + 1)

        if (afterDataset.length === 1) {
          // Direct file: dataset_X/file.ext
          directFiles.push(file)
        } else {
          // File in subfolder: dataset_X/subfolder/file.ext
          const folderPath = pathParts.slice(0, datasetIndex + 2).join('/')
          if (!folderGroups[folderPath]) folderGroups[folderPath] = []
          folderGroups[folderPath].push(file)
        }
      }
    })

    return { directFiles, folderGroups }
  }

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

  const handleClick = async () => {
    try {
      const zip = new JSZip()
      const { directFiles, folderGroups } = categorizeFiles(assignedFiles)

      // Handle direct files - give them UUIDs
      const processedDirectFiles =
        transformAssignedFilesToHaveUniqueNames(directFiles)

      // Handle folder groups - create ZIPs for each folder
      const processedFolderZips: ExtendedFile[] = []

      for (const [folderPath, filesInFolder] of Object.entries(folderGroups)) {
        const folderZip = new JSZip()
        const folderName = folderPath.split('/').pop() // Get last part (folder name)

        // Add all files from this folder to the folder ZIP, preserving internal structure
        filesInFolder.forEach((file) => {
          // Calculate relative path from the root folder (preserve internal structure)
          const pathParts = file.fullPath.split('/')
          const datasetIndex = pathParts.findIndex((part) => {
            const folder = assignedFolders.find(
              (f) =>
                f.fullPath ===
                pathParts.slice(0, pathParts.indexOf(part) + 1).join('/'),
            )
            return folder?.dtype === 'dataset'
          })
          const relativePath = pathParts.slice(datasetIndex + 2).join('/') // Everything after root folder
          folderZip.file(relativePath, file.file)
        })

        // Generate the folder ZIP blob
        const folderZipBlob = await folderZip.generateAsync({ type: 'blob' })

        // Create a UUID for this folder ZIP
        const folderUuid = v4()

        // Find the dataset parent UID - we need to traverse up to find the dataset container
        // The files point to the immediate folder, but we need the dataset container
        let currentFolderUid = filesInFolder[0]?.parentUid || ''
        let datasetParentUid = ''

        // Traverse up the folder hierarchy to find the dataset container
        while (currentFolderUid) {
          const currentFolder = assignedFolders.find(
            (f) => f.uid === currentFolderUid,
          )
          if (currentFolder?.dtype === 'dataset') {
            datasetParentUid = currentFolderUid
            break
          }
          currentFolderUid = currentFolder?.parentUid || ''
        }

        // Remove .zip extension from folder name if it exists to avoid .zip.zip
        const cleanFolderName = folderName?.endsWith('.zip')
          ? folderName.slice(0, -4)
          : folderName

        const folderZipFile: ExtendedFile = {
          ...filesInFolder[0], // Use first file as template
          name: `${folderUuid}.zip`,
          file: new File([folderZipBlob], `${cleanFolderName}.zip`, {
            type: 'application/zip',
          }),
          fullPath: folderPath, // Keep original folder path for JSON generation
          parentUid: datasetParentUid, // Ensure it points to the correct dataset container
          uid: folderUuid, // Set unique ID for the ZIP file
        }

        processedFolderZips.push(folderZipFile)
      }

      // Combine processed files for final ZIP
      const allProcessedFiles = [
        ...processedDirectFiles,
        ...processedFolderZips,
      ]

      // Add all processed files to main ZIP
      allProcessedFiles.forEach((file) => {
        zip.file(`attachments/${file.name}`, file.file)
      })

      const exportJsonData = await generateExportJson(
        allProcessedFiles,
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

      const exportedZipFileName = `SmartAdd-${zipDate}`

      saveAs(blob, exportedZipFileName)
      dragNotifications.showSuccess(
        `${exportedZipFileName} downloaded successfully`,
      )
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
