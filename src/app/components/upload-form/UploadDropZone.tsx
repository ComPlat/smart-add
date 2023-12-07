'use client'

import { filesDB } from '@/database/db'
import { extractFilesFromZip } from '@/helper/extractFilesFromZip'
import { uploadExtractedFiles } from '@/helper/uploadExtractedFiles'
import { InboxOutlined } from '@ant-design/icons'
import { Progress, Upload, UploadProps, message } from 'antd'
import { RcFile, UploadFile } from 'antd/es/upload'
import { Dispatch, SetStateAction, useState } from 'react'
import { v4 } from 'uuid'

import styles from './UploadDropZone.module.css'

// HINT: Necessary because of the way the Ant Design Upload Component
//       handles dropped folders. Need to store already uploaded folders
//       so that no duplicates get uploaded
// TODO: May cause issues when uploading folders with the same name as variable
//       is never cleared
const uploadedFolders: string[] = []

const handleCustomRequest = async ({
  file,
  filePaths,
  onSuccess,
  setFilePaths,
  setFolderPaths,
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
  if (typeof file === 'string')
    throw new TypeError('Uploaded file is a String!')
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

        for (const folder of folders) {
          currentPath = currentPath ? `${currentPath}/${folder}` : folder
          const existingFolder = await filesDB.folders
            .where('fullPath')
            .equals(currentPath)
            .first()

          if (!existingFolder) {
            await filesDB.folders.add({
              fullPath: currentPath,
              isFolder: true,
              name: folder,
              parentUid: '',
              uid: v4(),
            })
          }
        }
      }

      // HINT: Exlude Mac OS specific folder
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
  } else {
    setProgress(50)

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
            fullPath: currentFolder,
            isFolder: true,
            name: folderName,
            parentUid: '',
            uid: v4(),
          })
        })
      })

    await Promise.all(promises)

    setFolderPaths(uploadedFolders)

    filesDB.files
      .add({
        extension: file.webkitRelativePath.split('.').slice(-1)[0],
        file,
        fullPath: file.webkitRelativePath,
        isFolder: false,
        name: file.name,
        parentUid: file.uid.split('_')[0],
        path: parentPath,
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

  return true
}

const UploadDropZone = () => {
  const [progress, setProgress] = useState<number>(0)
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([])
  const [filePaths, setFilePaths] = useState<{ [key: string]: UploadFile }>({})
  const [folderPaths, setFolderPaths] = useState<string[]>([])

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
      const {
        file: { name, status },
      } = info

      setUploadFileList(info.fileList)

      if (status === 'done') {
        message.success(`${name} uploaded successfully.`)
      } else if (status === 'error') {
        message.error(`Upload of file ${name} failed.`)
      }
      setProgress
    },
    showUploadList: false,
  }

  return (
    <div className={styles['upload-wrapper']}>
      <Upload.Dragger {...uploadProps} openFileDialogOnClick={false}>
        <InboxOutlined className="text-6xl text-blue-500" />
        <p className="text-lg">Drag file to this area to upload</p>
        <p className="mt-2 text-sm text-neutral-400">
          Support for single, bulk or zip archive upload.
        </p>
      </Upload.Dragger>
      <Progress percent={progress} />
    </div>
  )
}
export { UploadDropZone, handleCustomRequest }
