import { ExtendedFile, assignmentsDB } from '@/database/db'

const renameFile = async (item: ExtendedFile, newName: string) => {
  const file = await assignmentsDB.assignedFiles.get({
    uid: item.uid,
  })

  if (!file) return

  console.log(file.fullPath)

  const updated = {
    ...file,
    fullPath: file.fullPath.includes('/')
      ? file.fullPath.split('/').slice(0, -1).join('/') + '/' + newName
      : newName,
    name: newName,
  }

  await assignmentsDB.assignedFiles.put(updated)
}

export default renameFile
