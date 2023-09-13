'use client'

import type { UploadProps } from 'antd'

import { db } from '@/database/db'
import { InboxOutlined } from '@ant-design/icons'
import { Upload, message } from 'antd'
import { RcFile } from 'antd/es/upload'
import React, { Fragment, useEffect, useState } from 'react'

const { Dragger } = Upload

const UploadForm: React.FC = () => {
  const [files, setFiles] = useState([] as (Blob | RcFile)[])

  useEffect(() => {
    const fetchFilesFromDb = async () => {
      setFiles(await db.files.toArray())
    }

    fetchFilesFromDb()
  }, [files])

  const uploadProps: UploadProps = {
    customRequest: ({ file, onProgress, onSuccess }) => {
      if (typeof file === 'string') {
        return console.error(file)
      }

      async function addFile(file: Blob | RcFile) {
        try {
          return db.files.add(file)
        } catch (err) {
          console.log(err)
        }
      }

      addFile(file)
        .then(async () => {
          onProgress?.({ percent: 100 })
          onSuccess?.(file)

          setFiles([...files, ...[file]])
          return true
        })
        .catch((err) => {
          console.error('Failed to save file:', err)
        })

      return true
    },
    directory: true,
    listType: 'picture',
    multiple: true,
    name: 'file',
    onChange(info) {
      const { status } = info.file
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
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
      <div>
        {files.map((file) => (
          <p key={file.name}>{file.name}</p>
        ))}
      </div>
    </Fragment>
  )
}

export { UploadForm }
