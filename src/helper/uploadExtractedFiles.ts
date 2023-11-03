import { filesDB } from '@/database/db'
import { RcFile } from 'antd/es/upload'
import { v4 } from 'uuid'

const uploadExtractedFiles = async (
  extractedFiles: {
    data: Promise<File>
    extension: string
    name: string
    parentUid: string
    path: string[]
    type: string
  }[],
  file: RcFile,
  setProgress: (progress: number) => void,
) => {
  const totalFiles = extractedFiles.length
  let uploadedFiles = 0

  await filesDB.files.add({
    extension: file.name.split('.').slice(-1)[0],
    file,
    fullPath: file.webkitRelativePath,
    name: file.name,
    parentUid: '',
    path: [],
    uid: file.uid,
  })

  await Promise.all(
    extractedFiles.map(async (extractedFile) => {
      const { data, name, path } = extractedFile
      if (name === '') {
        uploadedFiles++
        return
      }

      const fileData = await data
      await filesDB.files.add({
        extension: name.split('.').slice(-1)[0],
        file: fileData,
        fullPath: file.name + '/' + path.join('/') + '/' + name,
        name,
        parentUid: file.uid.split('.')[0],
        path: [file.name, ...path],
        uid: file.uid + '_' + v4(),
      })

      uploadedFiles++
      const percentageProgress = Math.round((uploadedFiles / totalFiles) * 100)
      setProgress(percentageProgress)
    }),
  )
}

export { uploadExtractedFiles }
