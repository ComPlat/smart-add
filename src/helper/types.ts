interface FileNode {
  canMove: boolean
  children: string[]
  data: string
  index: string
  isFolder: boolean
  uid: null | string
}

export type { FileNode }
