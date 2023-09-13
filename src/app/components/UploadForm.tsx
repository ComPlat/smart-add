'use client'

import type { UploadProps } from 'antd'

import { InboxOutlined } from '@ant-design/icons'
import { Upload, message } from 'antd'
import localforage from 'localforage'
import React, { Fragment, useEffect } from 'react'

const { Dragger } = Upload

const UploadForm: React.FC = () => {
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const keys = await localforage.keys()
        keys.map(async (key) => {
          const file = await localforage.getItem(key)
          if (!(file instanceof File)) {
            console.error(file)
            return null
          }
          return file.name
        })
      } catch (err) {
        console.error(err)
      }
    }

    fetchKeys()
  }, [])

  const uploadProps: UploadProps = {
    customRequest: ({ file, onProgress, onSuccess }) => {
      if (typeof file === 'string') {
        return console.error(file)
      }
      localforage
        .setItem(file.name, file)
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
    </Fragment>
  )
}

export { UploadForm }
