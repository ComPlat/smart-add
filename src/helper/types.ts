import { Metadata } from 'next'

interface FileNode {
  canMove: boolean
  children: string[]
  data: string
  index: string
  isFolder: boolean
  metadata: Metadata
  uid: null | string
}

interface FolderDepthMap {
  [depth: number]: string[]
}

export type { FileNode, FolderDepthMap }
