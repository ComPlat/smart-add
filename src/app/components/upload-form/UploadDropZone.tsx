'use client'

import { filesDB } from '@/database/db'
import { InboxOutlined } from '@ant-design/icons'
import { Upload, UploadProps, message } from 'antd'
import { RcFile } from 'antd/es/upload'
import JSZip from 'jszip'
import mime from 'mime-types'
import { v4 } from 'uuid'

interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number
}

const getFilenameAndExtension = (zipObject: {
  name: string
}): [extension: string, fileName: string] => {
  const components = zipObject.name.split(/[\/.]/)
  const fileName =
    components[components.length - 2] + '.' + components[components.length - 1]
  const extension = components[components.length - 1]

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
    if (!zipObject.dir) {
      const [extension, fileName] = getFilenameAndExtension(zipObject)
      const fileType = mime.lookup(extension ?? '') || ''

      extractedFiles.push({
        data: zipObject
          .async('blob')
          .then((blob) => new File([blob], fileName, { type: fileType })),
        name: fileName,
        path: relativePath,
        type: fileType,
      })
    }
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
    const fileData = await data
    if (name === '' || fileData.type === '') continue
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

  if (file.type === 'application/zip') {
    try {
      const extractedFiles = await extractFilesFromZip(file as RcFile)
      await uploadExtractedFiles(extractedFiles, file as RcFile)
      onProgress?.({ percent: 100 })
      onSuccess?.(file)
    } catch (err) {
      console.error('Failed to extract and upload ZIP file:', err)
    }
  } else {
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
  <Upload.Dragger {...uploadProps}>
    <InboxOutlined className="text-6xl text-blue-500" />
    <p className="text-lg">Click or drag file to this area to upload</p>
    <p className="mt-2 text-sm text-neutral-400">
      Support for a single or bulk upload. Strictly prohibited from uploading
      company data or other banned files.
    </p>
  </Upload.Dragger>
)

export { UploadDropZone, handleCustomRequest }
