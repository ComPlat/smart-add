import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'

export type TreeContextMenu = {
  closeContextMenu: () => void
  targetItem?: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
  x: number
  y: number
}
