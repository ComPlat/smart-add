'use client'

import { filesDB } from '@/database/db'
import { extractFilesFromZip } from '@/helper/extractFilesFromZip'
import { uploadExtractedFiles } from '@/helper/uploadExtractedFiles'
import { InboxOutlined } from '@ant-design/icons'
import { Progress, Upload, UploadProps, message } from 'antd'
import { RcFile } from 'antd/es/upload'
import { Dispatch, SetStateAction, useState } from 'react'
import { v4 } from 'uuid'

import styles from './UploadDropZone.module.css'

const handleCustomRequest = async ({
  file,
  onSuccess,
  setProgress,
  setUploadedFolders,
  uploadedFolders,
}: {
  file: Blob | RcFile | string
  onSuccess?: (body: File, xhr?: XMLHttpRequest) => void
  setProgress: (progress: number) => void
  setUploadedFolders: Dispatch<SetStateAction<string[]>>
  uploadedFolders: string[]
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

  const path = file.webkitRelativePath.split('/').slice(0, -1)

  const addFolderToDB = async (folderPath: string, file: RcFile) => {
    if (folderPath.includes('__MACOSX') || folderPath === file.name) return

    return await filesDB.folders.add({
      fullPath: folderPath,
      isFolder: true,
      name: folderPath.split('/').slice(-1)[0],
      parentUid: file.uid.split('_')[0],
      uid: v4(),
    })
  }

  if (file.type === 'application/zip') {
    try {
      setProgress(0)
      const extractedFiles = await extractFilesFromZip(file as RcFile)

      const folderPaths = new Set(
        extractedFiles.map((file) =>
          file.fullPath.split('/').slice(0, -1).join('/'),
        ),
      )

      for (const folderPath of folderPaths)
        await addFolderToDB(folderPath, file as RcFile)

      await uploadExtractedFiles(
        extractedFiles,
        file as RcFile,
        path,
        setProgress,
      )
      setProgress(100)
      onSuccess?.(file)
    } catch (err) {
      console.error('Failed to extract and upload ZIP file:', err)
    }
  } else {
    setProgress(50)

    const folderPath = file.webkitRelativePath.split('/').slice(0, -1).join('/')
    if ((uploadedFolders ? uploadedFolders : []).includes(folderPath)) return
    setUploadedFolders((prev) => {
      const newFolderPaths = prev ? [...prev, folderPath] : [folderPath]
      return [...new Set(newFolderPaths)]
    })

    await addFolderToDB(folderPath, file as RcFile)

    // TODO: Implement better handling after folder upload works correctly
    if (file.name.startsWith('.')) return
    filesDB.files
      .add({
        extension: file.webkitRelativePath.split('.').slice(-1)[0],
        file,
        fullPath: file.webkitRelativePath,
        isFolder: false,
        name: file.name,
        parentUid: file.uid.split('_')[0],
        path,
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
  const [uploadedFolders, setUploadedFolders] = useState<string[]>([])

  const uploadProps: UploadProps = {
    customRequest: (options) =>
      handleCustomRequest({
        ...options,
        setProgress,
        setUploadedFolders,
        uploadedFolders,
      }),
    directory: true,
    listType: 'text',
    multiple: true,
    name: 'file',
    onChange(info) {
      const {
        file: { name, status },
      } = info

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
