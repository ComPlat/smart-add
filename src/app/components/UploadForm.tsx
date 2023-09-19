'use client'

import { filesDB } from '@/database/db'
import { InboxOutlined } from '@ant-design/icons'
import { UploadProps, message } from 'antd'
import Dragger from 'antd/es/upload/Dragger'
// import { Upload, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import React, { Fragment } from 'react'

// const { Dragger } = Upload

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

  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   console.log(acceptedFiles)

  //   acceptedFiles.map((file) => {
  //     filesDB.files.add({
  //       file,
  //       path: file.path,
  //     })

  //     message.success(`${file.name} uploaded successfully.`)
  //   })
  // }, [])

  return (
    <Fragment>
      {/* <Dropzone
        onError={(error) => {
          return message.error(`File upload failed: ${error.message}`)
        }}
        multiple
        onDrop={onDrop}
      >
        {({ getInputProps, getRootProps }) => (
          <section>
            <div
              {...getRootProps()}
              className="h-36 w-full rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-center duration-200 hover:border-neutral-600"
            >
              <input {...getInputProps()} />
              <p className="my-4 text-3xl">Dropzone</p>
              <p className="my-4">
                Drag n drop some files here, or click to select files
              </p>
            </div>
          </section>
        )}
      </Dropzone>
      <div className="flex flex-col gap-1">
        {files.map((file) => (
          <Fragment key={file.file.name}>
            <div className="flex gap-2">
              <svg
                aria-hidden="true"
                className="self-center text-neutral-400"
                data-icon="paper-clip"
                fill="currentColor"
                focusable="false"
                height="1em"
                viewBox="64 64 896 896"
                width="1em"
              >
                <path d="M779.3 196.6c-94.2-94.2-247.6-94.2-341.7 0l-261 260.8c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0012.7 0l261-260.8c32.4-32.4 75.5-50.2 121.3-50.2s88.9 17.8 121.2 50.2c32.4 32.4 50.2 75.5 50.2 121.2 0 45.8-17.8 88.8-50.2 121.2l-266 265.9-43.1 43.1c-40.3 40.3-105.8 40.3-146.1 0-19.5-19.5-30.2-45.4-30.2-73s10.7-53.5 30.2-73l263.9-263.8c6.7-6.6 15.5-10.3 24.9-10.3h.1c9.4 0 18.1 3.7 24.7 10.3 6.7 6.7 10.3 15.5 10.3 24.9 0 9.3-3.7 18.1-10.3 24.7L372.4 653c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0012.7 0l215.6-215.6c19.9-19.9 30.8-46.3 30.8-74.4s-11-54.6-30.8-74.4c-41.1-41.1-107.9-41-149 0L463 364 224.8 602.1A172.22 172.22 0 00174 724.8c0 46.3 18.1 89.8 50.8 122.5 33.9 33.8 78.3 50.7 122.7 50.7 44.4 0 88.8-16.9 122.6-50.7l309.2-309C824.8 492.7 850 432 850 367.5c.1-64.6-25.1-125.3-70.7-170.9z"></path>
              </svg>
              <p className="text-sm leading-loose text-neutral-900 hover:bg-neutral-100">
                {file.file.name}
              </p>
            </div>
          </Fragment>
        ))}
      </div> */}
      {/* <input
        className="h-36 w-full rounded-xl border border-dashed border-neutral-300 bg-neutral-50 text-center duration-200 hover:border-neutral-600"
        multiple
        onDrop={onDrop}
        type="file"
      /> */}
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
