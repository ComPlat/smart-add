import { filesDB } from '@/database/db'
import { RcFile } from 'antd/es/upload'
import { v4 } from 'uuid'

const uploadExtractedFiles = async (
  extractedFiles: {
    data: Promise<File>
    extension: string
    fullPath: string
    name: string
    parentUid: string
    path: string[]
    type: string
  }[],
  file: RcFile,
  parentPath: string[],
  setProgress: (progress: number) => void,
) => {
  const totalFiles = extractedFiles.length
  let uploadedFiles = 0

  await Promise.all(
    extractedFiles.map(async (extractedFile) => {
      const { data, fullPath, name, path } = extractedFile
      if (name === '') {
        uploadedFiles++
        return
      }

      const fileData = await data
      await filesDB.files.add({
        extension: name.split('.').slice(-1)[0],
        file: fileData,
        fullPath: [...parentPath, fullPath].join('/'),
        isFolder: false,
        name,
        parentUid: file.uid.split('.')[0],
        path,
        uid: file.uid + '_' + v4(),
      })

      uploadedFiles++
      const percentageProgress = Math.round((uploadedFiles / totalFiles) * 100)
      setProgress(percentageProgress)
    }),
  )
}

export { uploadExtractedFiles }
