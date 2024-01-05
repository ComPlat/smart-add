import { ExtendedFile, filesDB } from '@/database/db'

const renameFile = async (item: ExtendedFile, newName: string) => {
  const file = await filesDB.files.get({
    uid: item.uid,
  })

  if (!file) return

  const updated = {
    ...file,
    fullPath: file.fullPath.includes('/')
      ? file.fullPath.split('/').slice(0, -1).join('/') + '/' + newName
      : newName,
    name: newName,
  }

  await filesDB.files.put(updated)
}

export default renameFile
