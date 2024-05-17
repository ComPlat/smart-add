'use client'

import { filesDB } from '@/database/db'
import { extractFilesFromZip } from '@/helper/extractFilesFromZip'
import { readSpreadsheet } from '@/helper/readSpreadsheet'
import { uploadExtractedFiles } from '@/helper/uploadExtractedFiles'
import { Progress, Upload, UploadProps, message } from 'antd'
import { RcFile, UploadFile } from 'antd/es/upload'
import { Dispatch, SetStateAction, useState } from 'react'
import { v4 } from 'uuid'

import {
  ReactionsWorksheetTable,
  SampleAnalysesWorksheetTable,
  SampleWorksheetTable,
} from '../zip-download/zodSchemes'
import styles from './UploadDropZone.module.css'

// HINT: Necessary because of the way the Ant Design Upload Component
//       handles dropped folders. Need to store already uploaded folders
//       so that no duplicates get uploaded
const uploadedFolders: string[] = []

type UploadDropZoneProps = {
  children?: React.ReactNode
}

const targetTreeRoot = 'inputTreeRoot'

const handleCustomRequest = async ({
  file,
  filePaths,
  onSuccess,
  setFilePaths,
  setProgress,
  uploadFileList,
}: {
  file: Blob | RcFile | string
  filePaths: { [key: string]: UploadFile }
  folderPaths: string[]
  onSuccess?: (body: File, xhr?: XMLHttpRequest) => void
  setFilePaths: Dispatch<SetStateAction<{ [key: string]: UploadFile }>>
  setFolderPaths: Dispatch<SetStateAction<string[]>>
  setProgress: (progress: number) => void
  uploadFileList: UploadFile[]
}) => {
  if (typeof file === 'string') {
    throw new TypeError('Uploaded file is a String!')
  }
  if (file instanceof Blob && !(file instanceof File)) {
    throw new TypeError('Uploaded file is a Blob, not a File!')
  }
  if (!('uid' in file)) {
    throw new TypeError('Uploaded file is a File, not an RcFile!')
  }
  if (!(typeof file.uid === 'string')) {
    throw new TypeError('Uploaded file has an uid that is not a string!')
  }

  const parentPath = file.webkitRelativePath.split('/').slice(0, -1)

  const zipTypes = [
    'multipart/x-zip',
    'application/zip',
    'application/zip-compressed',
    'application/x-zip-compressed',
  ]

  if (zipTypes.includes(file.type)) {
    try {
      setProgress(0)
      const extractedFiles = await extractFilesFromZip(file as RcFile)

      const folderPaths = extractedFiles.map((file) =>
        file.fullPath.split('/').slice(0, -1).join('/'),
      )

      const createFolders = async (path: string, parentPath: string[]) => {
        const folders = path.split('/')
        let currentPath = parentPath.join('/')
        const promises: Promise<void>[] = []

        for (const folder of folders) {
          currentPath = currentPath ? `${currentPath}/${folder}` : folder

          const existingFolder = await filesDB.folders
            .where('fullPath')
            .equals(currentPath)
            .first()

          if (!existingFolder) {
            const promise = filesDB.folders.add({
              dtype: 'folder',
              fullPath: currentPath,
              isFolder: true,
              name: folder,
              parentUid: '',
              reactionSchemeType: 'none',
              treeId: targetTreeRoot,
              uid: v4(),
            }) as unknown as Promise<void>

            promises.push(promise)
          }
        }

        await Promise.all(promises)
      }

      // HINT: Exclude MacOS specific folder
      const paths = folderPaths.filter((path) => !path.includes('__MACOSX'))

      for (const path of paths) await createFolders(path, parentPath)

      await uploadExtractedFiles(
        extractedFiles,
        file as RcFile,
        parentPath,
        setProgress,
      )
      setProgress(100)
      onSuccess?.(file)
    } catch (err) {
      console.error('Failed to extract and upload ZIP file:', err)
    }
  } else if (file.name.endsWith('.xlsx')) {
    const worksheetData = await readSpreadsheet(file)

    const addFolder = async (
      folderPath: string,
      name: string,
      parentUid: string,
    ) => {
      return filesDB.folders.add({
        dtype: 'folder',
        fullPath: folderPath,
        isFolder: true,
        name,
        parentUid,
        reactionSchemeType: 'none',
        treeId: targetTreeRoot,
        uid: v4(),
      })
    }

    const addFile = async (
      folderPath: string,
      row: object,
      sortValue: () => string,
    ) => {
      if (sortValue() === '(empty)') return

      return filesDB.files.add({
        extension: '',
        file: new File([JSON.stringify(row)], `${folderPath}/${sortValue()}`),
        fullPath: `${folderPath}/${sortValue()}`,
        isFolder: false,
        name: sortValue(),
        parentUid: file.uid as string,
        path: parentPath,
        treeId: targetTreeRoot,
        uid: v4(),
      })
    }

    const processTable = async (
      tableName: string,
      worksheetData: Record<string, object[]>,
    ) => {
      const folderPath = `${file.webkitRelativePath}/${tableName}`

      addFolder(folderPath, tableName, file.uid as string)

      const filePromises = worksheetData[tableName].map(async (row) => {
        const sortValue = () => {
          switch (tableName) {
            case 'reactions':
              return (row as ReactionsWorksheetTable)['r short label'] as string
            case 'sample':
              return (
                ((row as SampleWorksheetTable)['canonical smiles'] as string)
                  // HINT: Adjust 'canonical smiles' using %2F (URL encoding) to replace "/" in the name to avoid file tree issues.
                  //        However, changing the name directly affects the value, potentially causing issues
                  //        when referencing it elsewhere in the codebase.
                  .replaceAll('/', '%2F')
              )
            case 'sample_analyses':
              return (
                ((row as SampleAnalysesWorksheetTable)[
                  'sample name'
                ] as string) || '(empty)'
              )
            default:
              return '(not defined)'
          }
        }

        return addFile(folderPath, row, sortValue)
      })
      return await Promise.all(filePromises)
    }

    addFolder(file.webkitRelativePath, file.name, '')

    const tablePromises = Object.keys(worksheetData).map(async (tableName) => {
      processTable(tableName, worksheetData)
    })
    await Promise.all(tablePromises)

    setProgress(100)
    onSuccess?.(file)
    return true
  } else {
    const promises: Promise<Promise<number | void>[]>[] =
      uploadFileList.flatMap(async (fileObj) => {
        if (!fileObj.originFileObj) return [Promise.resolve()]

        const path = fileObj.originFileObj.webkitRelativePath
        const safeFilePaths = filePaths ? filePaths : {}

        if (path in safeFilePaths) return [Promise.resolve()]

        setFilePaths({ ...filePaths, [path]: fileObj })

        const pathParts = path.split('/')
        return pathParts.slice(0, -1).flatMap(async (_part, i) => {
          const currentFolder = pathParts.slice(0, i + 1).join('/')

          if (uploadedFolders.includes(currentFolder)) return Promise.resolve()

          uploadedFolders.push(currentFolder)

          const folderName = currentFolder.split('/').slice(-1)[0]
          return await filesDB.folders.add({
            dtype: 'folder',
            fullPath: currentFolder,
            isFolder: true,
            name: folderName,
            parentUid: '',
            reactionSchemeType: 'none',
            treeId: targetTreeRoot,
            uid: v4(),
          })
        })
      })

    await Promise.all(promises)

    const extension = file.webkitRelativePath.split('.').slice(-1)[0]

    filesDB.files
      .add({
        extension,
        file,
        fullPath: file.webkitRelativePath,
        isFolder: false,
        name: file.name,
        parentUid: file.uid.split('_')[0],
        path: parentPath,
        treeId: targetTreeRoot,
        uid: v4(),
      })
      .then(async () => {
        setProgress(100)
        onSuccess?.(file)
        return true
      })
      .catch((err) => {
        console.error('Failed to save file:', err)
      })
  }

  message.success(`${file.name} uploaded successfully.`)

  return true
}

const UploadDropZone = ({ children }: UploadDropZoneProps) => {
  const [progress, setProgress] = useState<number>(0)
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([])
  const [filePaths, setFilePaths] = useState<{ [key: string]: UploadFile }>({})
  const [folderPaths, setFolderPaths] = useState<string[]>([])

  const resetUploadState = () => {
    setProgress(0)
    setFilePaths({})
    uploadedFolders.length = 0
  }

  const uploadProps: UploadProps = {
    customRequest: (options) =>
      handleCustomRequest({
        ...options,
        filePaths,
        folderPaths,
        setFilePaths,
        setFolderPaths,
        setProgress,
        uploadFileList,
      }),
    directory: true,
    listType: 'text',
    multiple: true,
    name: 'file',
    onChange(info) {
      setUploadFileList(info.fileList)
      setProgress
    },
    showUploadList: false,
  }

  // HINT: Progress will be moved to notifications
  return (
    <div className="h-full w-full">
      <div className={styles['upload-wrapper']}>
        <Upload.Dragger
          {...uploadProps}
          style={{
            background: 'none',
            backgroundColor: 'none',
            border: 'none',
            borderRadius: 'none',
            height: '100%',
          }}
          fileList={[]}
          onDrop={resetUploadState}
          openFileDialogOnClick={false}
        >
          <Progress percent={progress} />

          {children}
        </Upload.Dragger>
      </div>
    </div>
  )
}

export { UploadDropZone, handleCustomRequest }
