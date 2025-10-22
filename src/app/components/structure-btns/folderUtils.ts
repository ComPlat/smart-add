import {
  Datatype,
  ExtendedFolder,
  Metadata,
  ReactionSchemeType,
  filesDB,
} from '@/database/db'
import { FileNode } from '@/helper/types'
import { v4 } from 'uuid'

export const getUniqueFolderName = (
  folderName: string,
  tree: Record<string, FileNode>,
  baseName: string,
  appendNumberIfDuplicate: boolean = true,
  parentPath?: string,
) => {
  // Filter tree to only include siblings (same parent) if parentPath is provided
  const relevantNodes =
    parentPath !== undefined
      ? Object.entries(tree)
          .filter(([path]) => {
            // Get the parent of this node by removing the last segment
            const lastSlashIndex = path.lastIndexOf('/')
            const nodeparent =
              lastSlashIndex > 0 ? path.substring(0, lastSlashIndex) : ''
            return nodeparent === parentPath
          })
          .map(([, node]) => node)
      : Object.values(tree)

  // When appendNumberIfDuplicate is false, respect user's exact input
  if (!appendNumberIfDuplicate) {
    // Check if the exact folderName (as entered by user) already exists among siblings
    const exactMatch = relevantNodes.some((node) => node.data === folderName)

    // If exact name doesn't exist, use it as-is
    if (!exactMatch) {
      return folderName
    }

    // If exact name exists, we need to find a unique variant
    // Strip any trailing _number to get base name for pattern matching
    const cleanBaseName = folderName.replace(/_\d+$/, '') || baseName
    const baseNamePattern = new RegExp(`^${cleanBaseName}(_\\d+)?$`)

    const searchTree = (node: FileNode) => {
      const match = node.data.match(baseNamePattern)
      return match && match[1] ? parseInt(match[1].substring(1), 10) : 0
    }

    const highestCounter = Math.max(...relevantNodes.map(searchTree), 0)
    return `${cleanBaseName}_${highestCounter + 1}`
  }

  // Old behavior: Always strip numbers and auto-increment
  const cleanBaseName = folderName.replace(/_\d+$/, '') || baseName
  const baseNamePattern = new RegExp(`^${cleanBaseName}(_\\d+)?$`)

  const searchTree = (node: FileNode) => {
    const match = node.data.match(baseNamePattern)
    return match && match[1] ? parseInt(match[1].substring(1), 10) : 0
  }

  const highestCounter = Math.max(...relevantNodes.map(searchTree), 0)

  const isDuplicate = relevantNodes.some((node) => node.data === cleanBaseName)

  if (!isDuplicate) {
    return cleanBaseName
  }

  return `${cleanBaseName}_${highestCounter + 1}`
}

export const createFolder = async (
  path: string,
  name: string,
  assignmentTree: boolean = false,
  parentUid: string = '',
  metadata: Metadata = { container_type: 'folder' },
  dtype: Datatype = 'folder',
  reactionSchemeType: ReactionSchemeType = 'none',
): Promise<ExtendedFolder> => {
  const folder: ExtendedFolder = {
    dtype,
    fullPath: path,
    isFolder: true,
    metadata,
    name,
    parentUid,
    reactionSchemeType,
    treeId: assignmentTree ? 'assignmentTreeRoot' : 'inputTreeRoot',
    uid: v4(),
  }

  await filesDB.folders.put(folder)
  return folder
}

export const createSubFolders = async (
  basePath: string,
  names: string[],
  parentUid: string,
  metadatas: Metadata[] = [],
  dtypes: Datatype[] = Array(names.length).fill('folder'),
  reactionSchemeTypes: ReactionSchemeType[] = Array(names.length).fill('none'),
) => {
  return await Promise.all(
    names.map((name, index) =>
      createFolder(
        `${basePath}/${name}`,
        name,
        true,
        parentUid,
        metadatas[index],
        dtypes[index],
        reactionSchemeTypes[index],
      ),
    ),
  )
}
