import { RcFile } from 'antd/es/upload'
import Dexie, { Table } from 'dexie'

export type ExtendedFile = {
  extension: string
  file: Blob | RcFile
  fullPath: string
  id?: number
  isFolder: boolean
  name: string
  parentUid: string
  path: string[]
  treeId: string
  uid: string
}

export type ExtendedFolder = {
  fullPath: string
  id?: number
  isFolder: boolean
  name: string
  parentUid: string
  treeId: string
  uid: string
}

export class FilesDBCreator extends Dexie {
  files!: Table<ExtendedFile, number>
  folders!: Table<ExtendedFolder, number>

  constructor() {
    super('filesDatabase')
    this.version(1).stores({
      files: '++id, fullPath, name, uid, extension, parentUid, treeId',
      folders: '++id, fullPath, name, uid, parentUid, treeId',
    })
  }
}

export const filesDB = new FilesDBCreator()
