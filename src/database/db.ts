import { RcFile } from 'antd/es/upload'
import Dexie, { Table } from 'dexie'

export type ExtendedFile = {
  extension: string
  file: Blob | RcFile
  fullPath: string
  id?: number
  name: string
  parentUid: string
  path: string[]
  uid: string
}

export class FilesDBCreator extends Dexie {
  files!: Table<ExtendedFile, number>

  constructor() {
    super('filesDatabase')
    this.version(1).stores({
      files: '++id, fullPath, name, uid, extension, parentUid',
    })
  }
}

export const filesDB = new FilesDBCreator()
