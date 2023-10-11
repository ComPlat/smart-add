import { RcFile } from 'antd/es/upload'
import Dexie, { Table } from 'dexie'

export type ExtendedFile = {
  file: Blob | RcFile
  id?: number
  name: string
  path: string
  uid: string
}

export class FilesDBCreator extends Dexie {
  files!: Table<ExtendedFile, number>

  constructor() {
    super('filesDatabase')
    this.version(1).stores({ files: '++id, path, name, uid' })
  }
}

export const filesDB = new FilesDBCreator()
