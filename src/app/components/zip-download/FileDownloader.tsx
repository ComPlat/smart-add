'use client'

import { useState } from 'react'
import { ExtendedFile, filesDB } from '@/database/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { v4 } from 'uuid'
import { Button } from '../workspace/Button'
import { generateExportJson } from './jsonGenerator'
import { dragNotifications } from '@/utils/dragNotifications'
import { ExportCollectionModal } from '../chemotion/ExportCollectionModal'
import { ChemotionAuthModal } from '../chemotion/ChemotionAuthModal'
import { chemotionApi } from '@/services/chemotionApi'

const zipDate = new Date().toLocaleDateString().replace(/\//g, '-')

const FileDownloader = () => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const assignedFiles =
    useLiveQuery(() =>
      filesDB.files.where('treeId').equals('assignmentTreeRoot').toArray(),
    ) || []
  const assignedFolders =
    useLiveQuery(() =>
      filesDB.folders.where('treeId').equals('assignmentTreeRoot').toArray(),
    ) || []

  const hasContent = assignedFiles.length > 0 || assignedFolders.length > 0

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

  const generateZipBlob = async (): Promise<Blob | null> => {
    try {
      const zip = new JSZip()
      const { directFiles, folderGroups } = categorizeFiles(assignedFiles)

      const processedDirectFiles =
        transformAssignedFilesToHaveUniqueNames(directFiles)

      const processedFolderZips: ExtendedFile[] = []

      for (const [folderPath, filesInFolder] of Object.entries(folderGroups)) {
        const folderZip = new JSZip()
        const folderName = folderPath.split('/').pop()

        filesInFolder.forEach((file) => {
          const pathParts = file.fullPath.split('/')
          const datasetIndex = pathParts.findIndex((part) => {
            const folder = assignedFolders.find(
              (f) =>
                f.fullPath ===
                pathParts.slice(0, pathParts.indexOf(part) + 1).join('/'),
            )
            return folder?.dtype === 'dataset'
          })
          const relativePath = pathParts.slice(datasetIndex + 2).join('/')
          folderZip.file(relativePath, file.file)
        })

        const folderZipBlob = await folderZip.generateAsync({ type: 'blob' })
        const folderUuid = v4()

        let currentFolderUid = filesInFolder[0]?.parentUid || ''
        let datasetParentUid = ''

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

        const cleanFolderName = folderName?.endsWith('.zip')
          ? folderName.slice(0, -4)
          : folderName

        const folderZipFile: ExtendedFile = {
          ...filesInFolder[0],
          name: `${folderUuid}.zip`,
          file: new File([folderZipBlob], `${cleanFolderName}.zip`, {
            type: 'application/zip',
          }),
          fullPath: folderPath,
          parentUid: datasetParentUid,
          uid: folderUuid,
        }

        processedFolderZips.push(folderZipFile)
      }

      const allProcessedFiles = [
        ...processedDirectFiles,
        ...processedFolderZips,
      ]

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
      return blob
    } catch (error) {
      console.error('Error generating zip:', error)
      return null
    }
  }

  const handleDownload = async () => {
    setIsExportModalOpen(false)
    try {
      const blob = await generateZipBlob()

      if (!blob) {
        dragNotifications.showError('Failed to generate export file')
        return
      }

      const exportedZipFileName = `SmartAdd-${zipDate}`
      saveAs(blob, exportedZipFileName)
      dragNotifications.showSuccess(
        `${exportedZipFileName} downloaded successfully`,
      )
    } catch (error) {
      console.error('Download error:', error)
      dragNotifications.showError('Failed to download file')
    }
  }

  const handleUploadToChemotion = () => {
    setIsExportModalOpen(false)
    if (chemotionApi.isAuthenticated()) {
      handleUpload()
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleAuthenticate = async (
    serverUrl: string,
    email: string,
    password: string,
  ) => {
    setIsAuthenticating(true)
    try {
      const result = await chemotionApi.authenticate(serverUrl, email, password)

      if (result.success) {
        dragNotifications.showSuccess('Connected to Chemotion ELN')
        setIsAuthModalOpen(false)
        await handleUpload()
      } else {
        dragNotifications.showError(result.message || 'Authentication failed')
      }
    } catch (error) {
      dragNotifications.showError('Authentication failed. Please try again.')
      console.error('Auth error:', error)
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleUpload = async () => {
    setIsUploading(true)
    try {
      const zipBlob = await generateZipBlob()

      if (!zipBlob) {
        dragNotifications.showError('Failed to generate export file')
        return
      }

      const filename = `SmartAdd-${zipDate}.zip`
      const result = await chemotionApi.uploadToChemotion(zipBlob, filename)

      if (result.success) {
        dragNotifications.showSuccess(
          'Successfully uploaded to Chemotion ELN! Please note that it may take a minute for the collection to appear in your ELN account.',
        )
      } else {
        // Check if authentication expired
        if (result.message?.includes('Authentication expired')) {
          dragNotifications.showError(result.message)
          // Re-open auth modal for user to login again
          setIsAuthModalOpen(true)
        } else {
          dragNotifications.showError(result.message || 'Upload failed')
        }
      }
    } catch (error) {
      dragNotifications.showError('Upload failed. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleBackFromAuth = () => {
    setIsAuthModalOpen(false)
    setIsExportModalOpen(true)
  }

  return (
    <>
      <Button
        disabled={!hasContent || isUploading}
        label={isUploading ? 'Uploading...' : 'Export Collection'}
        onClick={() => setIsExportModalOpen(true)}
        variant="primary"
      />
      <ExportCollectionModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onDownload={handleDownload}
        onUploadToChemotion={handleUploadToChemotion}
      />
      <ChemotionAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onBack={handleBackFromAuth}
        onAuthenticate={handleAuthenticate}
        isLoading={isAuthenticating}
      />
    </>
  )
}

export { FileDownloader }
