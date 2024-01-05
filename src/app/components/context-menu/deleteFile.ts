import { ExtendedFile, filesDB } from '@/database/db'

const deleteFile = async (file: ExtendedFile) => {
  if (!('id' in file)) {
    throw new TypeError('Can not delete because the file is missing an id!')
  }

  if (!(typeof file.id === 'number')) {
    throw new TypeError(
      'Can not delete because the id of file is not a number!',
    )
  }

  await filesDB.files.delete(file.id)
}

export default deleteFile
