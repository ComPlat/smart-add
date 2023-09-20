'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { InboxOutlined } from '@ant-design/icons'
import { Upload, UploadProps, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { Fragment } from 'react'

const { Dragger } = Upload

const DeleteFileButton = ({ file }: { file: ExtendedFile }) => (
  <button
    onClick={(event) => {
      event.preventDefault()

      if (!('id' in file)) {
        throw new TypeError('Can not delete because the file is missing an id!')
      }

      if (!(typeof file.id === 'number')) {
        throw new TypeError(
          'Can not delete because the id of file is not a number!',
        )
      }

      filesDB.files.delete(file.id)
    }}
  >
    Delete
  </button>
)

const FileList = ({ files }: { files: ExtendedFile[] }) => (
  <div className="flex flex-col">
    {files.map((file) => (
      <div className="flex justify-between text-sm " key={file.id}>
        <p className="leading-loose text-neutral-900 ">{file.name}</p>
        <DeleteFileButton file={file} />
      </div>
    ))}
  </div>
)

const UploadForm: React.FC = () => {
  const files = useLiveQuery(() => filesDB.files.toArray()) || []

  const uploadProps: UploadProps = {
    customRequest: ({ file, onProgress, onSuccess }) => {
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
    listType: 'text',
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
    showUploadList: false,
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
      <FileList files={files} />
    </Fragment>
  )
}

export { UploadForm }
