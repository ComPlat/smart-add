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

  const extractFilesRecursively = async (
    relativePath: string,
    zipObject: JSZip.JSZipObject,
    currentPath: string[] = [],
  ) => {
    if (zipObject.dir) return

    const [extension, fileName] = getFilenameAndExtension(zipObject)
    const fileType = mime.lookup(extension ?? '') || 'application/octet-stream'
    const path = relativePath.split('/').filter((str) => str !== '')

    const fullPath = [...currentPath, ...path].join('/')

    // Check if the file is not inside a folder with the same name as itself
    extractedFiles.push({
      data: zipObject
        .async('blob')
        .then((blob) => new File([blob], fileName, { type: fileType })),
      extension,
      fullPath,
      name: fileName,
      parentUid: file.uid,
      path: [...currentPath, ...path],
      type: fileType,
    })

    if (fileName.endsWith('.zip')) {
      const nestedZipData = await JSZip.loadAsync(await zipObject.async('blob'))
      const nestedCurrentPath = [...currentPath, ...path]
      await Promise.all(
        Object.keys(nestedZipData.files).map(async (nestedRelativePath) => {
          const nestedZipObject = nestedZipData.files[nestedRelativePath]
          await extractFilesRecursively(
            nestedRelativePath,
            nestedZipObject,
            nestedCurrentPath,
          )
        }),
      )
    }
  }

  await Promise.all(
    Object.keys(zipData.files).map(async (relativePath) => {
      const zipObject = zipData.files[relativePath]
      await extractFilesRecursively(relativePath, zipObject)
    }),
  )

  return extractedFiles
}

export { extractFilesFromZip }
