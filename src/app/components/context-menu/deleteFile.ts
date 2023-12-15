import { ExtendedFile, assignmentsDB } from '@/database/db'

const deleteFile = async (file: ExtendedFile) => {
  if (!('id' in file)) {
    throw new TypeError('Can not delete because the file is missing an id!')
  }

  if (!(typeof file.id === 'number')) {
    throw new TypeError(
      'Can not delete because the id of file is not a number!',
    )
  }

  await assignmentsDB.assignedFiles.delete(file.id)
}

export default deleteFile
