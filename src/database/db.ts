import { RcFile } from 'antd/es/upload'
import Dexie, { Table } from 'dexie'

export class IndexedDbCreator extends Dexie {
  // 'file' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  files!: Table<Blob | RcFile>

  constructor() {
    super('myDatabase')
    this.version(1).stores({
      files: '++id, file', // Primary key and indexed props
    })
  }
}

export const db = new IndexedDbCreator()
