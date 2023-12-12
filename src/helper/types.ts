interface FileNode {
  canMove: boolean
  children: string[]
  data: string
  index: string
  isFolder: boolean
  uid: null | string
}

interface FolderDepthMap {
  [depth: number]: string[]
}

export type { FileNode, FolderDepthMap }
