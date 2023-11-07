import { RcFile } from 'antd/es/upload'
import JSZip from 'jszip'
import mime from 'mime-types'

const getFilenameAndExtension = (zipObject: {
  name: string
}): [extension: string, fileName: string] => {
  const components = zipObject.name.split(/\/|\.(?=[^.]*$)/)
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
    extension: string
    fullPath: string
    name: string
    parentUid: string
    path: string[]
    type: string
  }[] = []

  zipData.forEach((relativePath, zipObject) => {
    if (zipObject.dir) return

    const [extension, fileName] = getFilenameAndExtension(zipObject)
    const fileType = mime.lookup(extension ?? '') || 'application/octet-stream'
    const path = relativePath
      .split('/')
      .slice(0, -1)
      .filter((str) => str !== '')

    extractedFiles.push({
      data: zipObject
        .async('blob')
        .then((blob) => new File([blob], fileName, { type: fileType })),
      extension,
      fullPath: path.join('/') + '/' + fileName,
      name: fileName,
      parentUid: file.uid,
      path,
      type: fileType,
    })
  })

  return extractedFiles
}

export { extractFilesFromZip }
