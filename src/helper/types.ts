import { Metadata, Datatype, ReactionSchemeType } from '@/database/db'

interface FileNode {
  canMove: boolean
  children: string[]
  data: string
  index: string
  isFolder: boolean
  metadata?: Metadata
  uid: null | string
  dtype?: Datatype
  reactionSchemeType?: ReactionSchemeType
}

interface FolderDepthMap {
  [depth: number]: string[]
}

export type { FileNode, FolderDepthMap }
