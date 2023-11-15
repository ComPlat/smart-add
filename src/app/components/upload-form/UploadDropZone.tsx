'use client'

import { filesDB } from '@/database/db'
import { extractFilesFromZip } from '@/helper/extractFilesFromZip'
import { uploadExtractedFiles } from '@/helper/uploadExtractedFiles'
import { UploadOutlined } from '@ant-design/icons'
import { Progress, UploadProps, message } from 'antd'
import Upload, { RcFile } from 'antd/es/upload'
import { useState } from 'react'
import { v4 } from 'uuid'

import styles from './UploadDropZone.module.css'

const handleCustomRequest = async ({
  file,
  onSuccess,
  setProgress,
}: {
  file: Blob | RcFile | string
  onSuccess?: (body: File, xhr?: XMLHttpRequest) => void
  setProgress: (progress: number) => void
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

  if (file.type === 'application/zip') {
    try {
      setProgress(0)
      const extractedFiles = await extractFilesFromZip(file as RcFile)
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
    filesDB.files
      .add({
        extension: file.webkitRelativePath.split('.').slice(-1)[0],
        file,
        fullPath: file.webkitRelativePath,
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

  const uploadProps: UploadProps = {
    customRequest: (options) =>
      handleCustomRequest({ ...options, setProgress }),
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

  // TODO: Move progress to message
  return (
    <div className={styles['upload-wrapper']}>
      <Upload.Dragger
        {...uploadProps}
        style={{
          background: 'none',
          backgroundColor: 'none',
          border: 'none',
        }}
        openFileDialogOnClick={false}
      >
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-20 py-8 max-md:max-w-full max-md:px-5">
          <UploadOutlined className="text-5xl text-gray-300" />
          <div className="mt-4 flex flex-col items-stretch self-stretch">
            <div className="text-center text-base font-medium leading-6 text-black text-opacity-80">
              Drag your files or folders to this area to upload
            </div>
            <div className="mt-1 text-center text-sm leading-5 text-black text-opacity-50">
              None of the files will be uploaded to a server. Files will be
              saved in a browser database.
            </div>
          </div>
        </div>
      </Upload.Dragger>
      <Progress percent={progress} />
    </div>
  )
}
export { UploadDropZone, handleCustomRequest }
