'use client'

import { filesDB } from '@/database/db'
import { InboxOutlined } from '@ant-design/icons'
import { Upload, UploadProps, message } from 'antd'
import { RcFile } from 'antd/es/upload'
import JSZip from 'jszip'
import mime from 'mime-types'
import { v4 } from 'uuid'

import styles from './UploadDropZone.module.css'
interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number
}

const getFilenameAndExtension = (zipObject: {
  name: string
}): [extension: string, fileName: string] => {
  const components = zipObject.name.split(/[\/.]/)
  const [fileNameWithoutExtension, extension] = components.slice(-2)
  const fileName = `${fileNameWithoutExtension}.${extension}`

  return !fileName.startsWith('.') && !zipObject.name.startsWith('__')
    ? [extension, fileName]
    : ['', '']
}

const extractFilesFromZip = async (file: RcFile) => {
  const zip = new JSZip()
  const zipData = await zip.loadAsync(file)

  const extractedFiles: {
    data: Promise<File>
    name: string
    path: string
    type: string
  }[] = []

  zipData.forEach((relativePath, zipObject) => {
    if (zipObject.dir) return

    const [extension, fileName] = getFilenameAndExtension(zipObject)
    const fileType = mime.lookup(extension ?? '') || 'application/octet-stream'

    extractedFiles.push({
      data: zipObject
        .async('blob')
        .then((blob) => new File([blob], fileName, { type: fileType })),
      name: fileName,
      path: relativePath,
      type: fileType,
    })
  })

  return extractedFiles
}

const uploadExtractedFiles = async (
  extractedFiles: {
    data: Promise<File>
    name: string
    path: string
    type: string
  }[],
  file: RcFile,
) => {
  for (const extractedFile of extractedFiles) {
    const { data, name, path } = extractedFile
    if (name === '') continue

    const fileData = await data
    await filesDB.files.add({
      file: fileData,
      name,
      path,
      uid: file.uid + '_' + v4(),
    })
  }
}

const handleCustomRequest = async ({
  file,
  onProgress,
  onSuccess,
}: {
  file: Blob | RcFile | string
  onProgress?: (event: UploadProgressEvent) => void
  onSuccess?: (body: File, xhr?: XMLHttpRequest) => void
}) => {
  // FIXME: More sensible percentages needed, also we need to show progress on UI.
  //        Otherwise some things feel buggy, for example adding "large" zip file causes FileList
  //        to show nothing until it is processed completely.
  onProgress?.({ percent: 1 })
  if (typeof file === 'string')
    throw new TypeError('Uploaded file is a String!')
  onProgress?.({ percent: 2 })
  if (file instanceof Blob && !(file instanceof File)) {
    throw new TypeError('Uploaded file is a Blob, not a File!')
  }
  onProgress?.({ percent: 3 })
  if (!('uid' in file)) {
    throw new TypeError('Uploaded file is a File, not an RcFile!')
  }
  onProgress?.({ percent: 4 })
  if (!(typeof file.uid === 'string')) {
    throw new TypeError('Uploaded file has an uid that is not a string!')
  }
  onProgress?.({ percent: 5 })

  if (file.type === 'application/zip') {
    onProgress?.({ percent: 6 })
    try {
      const extractedFiles = await extractFilesFromZip(file as RcFile)
      onProgress?.({ percent: 50 })
      await uploadExtractedFiles(extractedFiles, file as RcFile)
      onProgress?.({ percent: 100 })
      onSuccess?.(file)
    } catch (err) {
      console.error('Failed to extract and upload ZIP file:', err)
    }
  } else {
    onProgress?.({ percent: 50 })
    filesDB.files
      .add({
        file,
        name: file.name,
        path: file.webkitRelativePath,
        uid: v4(),
      })
      .then(async () => {
        onProgress?.({ percent: 100 })
        onSuccess?.(file)
        return true
      })
      .catch((err) => {
        console.error('Failed to save file:', err)
      })
  }

  return true
}

const uploadProps: UploadProps = {
  customRequest: handleCustomRequest,
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
  },
  showUploadList: false,
}

const UploadDropZone = () => (
  <div className={styles['upload-wrapper']}>
    <Upload.Dragger {...uploadProps} openFileDialogOnClick={false}>
      <InboxOutlined className="text-6xl text-blue-500" />
      <p className="text-lg">Drag file to this area to upload</p>
      <p className="mt-2 text-sm text-neutral-400">
        Support for single, bulk or zip archive upload.
      </p>
    </Upload.Dragger>
  </div>
)

export { UploadDropZone, handleCustomRequest }
