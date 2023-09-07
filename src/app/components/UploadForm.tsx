'use client'

import type { UploadProps } from 'antd'

import { InboxOutlined } from '@ant-design/icons'
import { Upload, message } from 'antd'
import localforage from 'localforage'
import React, { useState } from 'react'

const { Dragger } = Upload

const UploadForm: React.FC = () => {
  const [fileName, setFileName] = useState([] as string[])

  localforage
    .keys()
    .then((keys) =>
      keys.forEach((key) => {
        localforage
          .getItem(key)
          .then((file) => {
            if (!(file instanceof File)) {
              return console.error(file)
            }
            return setFileName([...fileName, ...[file.name]])
          })
          .catch((err) => console.error(err))
      }),
    )
    .catch((err) => console.error(err))

  // ((keys) => {
  //   keys.forEach((key) => {
  //     localforage.getItem(key).then((file) => {
  //       setFileName([...fileName, ...[file.name]])
  //     })
  //   })
  // })
  // .then((file) => setFileName([file.name]))
  // .catch((err) => console.log(err))

  const props: UploadProps = {
    customRequest: ({ file, onProgress, onSuccess }) => {
      console.log(file)
      if (typeof file === 'string') {
        return console.error(file)
      }
      localforage
        .setItem(file.name, file)
        .then(async function () {
          console.log('File saved to localForage')
          onProgress?.({ percent: 100 })
          onSuccess?.(file)

          // const myFile = await myFilePromiseFactory()
          // setFileName(myFile.name)
          return true
        })
        .catch(function (error) {
          console.error('Failed to save file:', error)
        })

      return true
    },
    listType: 'picture',
    multiple: true,
    name: 'file',
    onChange(info) {
      const { status } = info.file
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    },
  }

  return (
    <div>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from
          uploading company data or other banned files.
        </p>
      </Dragger>
      <div>File name: {fileName}</div>
    </div>
  )
}

export { UploadForm }
