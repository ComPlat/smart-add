'use client'

import { filesDB } from '@/database/db'
import { InboxOutlined } from '@ant-design/icons'
import { Upload, UploadProps, message } from 'antd'
// import { Upload, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import React, { Fragment } from 'react'

const { Dragger } = Upload

const UploadForm: React.FC = () => {
  const files = useLiveQuery(() => filesDB.files.toArray()) || []

  const uploadProps: UploadProps = {
    customRequest: ({ file, onProgress, onSuccess }) => {
      if (typeof file === 'string')
        throw new Error('Uploaded file is a string!')

      console.log('file: ', file)

      filesDB.files
        .add({
          file,
          name: file.name,
          path: file.webkitRelativePath,
          uid: file.uid,
        })
        .then(async () => {
          onProgress?.({ percent: 100 })
          onSuccess?.(file)

          return true
        })
        .catch((err) => {
          console.error('Failed to save file:', err)
        })

      return true
    },
    directory: true,
    fileList: files,
    listType: 'text',
    multiple: true,
    name: 'file',
    onChange(info) {
      console.log(info)
      const { status } = info.file
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    onRemove(file) {
      filesDB.files.delete(file.id)
    },
  }

  return (
    <Fragment>
      <Dragger {...uploadProps}>
        <p className="text-6xl text-blue-500">
          <InboxOutlined />
        </p>
        <p className="text-lg">Click or drag file to this area to upload</p>
        <p className="mt-2 text-sm text-neutral-400">
          Support for a single or bulk upload. Strictly prohibited from
          uploading company data or other banned files.
        </p>
      </Dragger>
    </Fragment>
  )
}

export { UploadForm }
