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
  uid: string
}

export type ExtendedFolder = {
  fullPath: string
  id?: number
  isFolder: boolean
  name: string
  parentUid: string
  uid: string
}

export class FilesDBCreator extends Dexie {
  files!: Table<ExtendedFile, number>
  folders!: Table<ExtendedFolder, number>

  constructor() {
    super('filesDatabase')
    this.version(1).stores({
      files: '++id, fullPath, name, uid, extension, parentUid',
      folders: '++id, fullPath, name, uid, parentUid',
    })
  }
}

export class AssignmentsDBCreator extends Dexie {
  assignedFiles!: Table<ExtendedFile, number>
  assignedFolders!: Table<ExtendedFolder, number>

  constructor() {
    super('assignmentsDatabase')
    this.version(1).stores({
      assignedFiles: '++id, fullPath, name, uid, extension, parentUid',
      assignedFolders: '++id, fullPath, name, uid, parentUid',
    })
  }
}

export const filesDB = new FilesDBCreator()
export const assignmentsDB = new AssignmentsDBCreator()
