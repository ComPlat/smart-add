import {
  ArrayType,
  TemperatureObject,
  TextObject,
} from '@/app/components/zip-download/zodSchemes'
import { RcFile } from 'antd/es/upload'
import Dexie, { Table } from 'dexie'

export type Metadata = {
  [key: string]:
    | ArrayType
    | TemperatureObject
    | TextObject
    | boolean
    | null
    | number
    | string
}

export type MetadataValue =
  | ArrayType
  | TemperatureObject
  | TextObject
  | boolean
  | null
  | number
  | string
  | undefined

export type ExtendedFile = {
  extension: string
  file: Blob | RcFile
  fullPath: string
  id?: number
  isFolder: boolean
  metadata?: Metadata
  name: string
  parentUid: string
  path: string[]
  treeId: string
  uid: string
}

export type Datatype =
  | 'analyses'
  | 'analysis'
  | 'dataset'
  | 'folder'
  | 'reaction'
  | 'sample'
  | 'structure'

export type ReactionSchemeType =
  | 'none'
  | 'product'
  | 'reactant'
  | 'startingMaterial'

export type ExtendedFolder = {
  dtype: Datatype
  fullPath: string
  id?: number
  isFolder: boolean
  metadata?: Metadata
  name: string
  parentUid: string
  reactionSchemeType: ReactionSchemeType
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
      folders:
        '++id, fullPath, name, uid, parentUid, treeId, dtype, reactionSchemeType',
    })
  }
}

export const filesDB = new FilesDBCreator()
