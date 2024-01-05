import { FileNode } from '@/helper/types'

import {
  createFolder,
  createSubFolders,
  getUniqueFolderName,
} from './folderUtils'

export const createSample = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
) => {
  const uniqueFolderName = getUniqueFolderName(
    baseFolderName,
    tree,
    baseFolderName,
  )

  const promises = [
    createFolder(uniqueFolderName, uniqueFolderName, true),
    createSubFolders(uniqueFolderName, ['structure', 'analyses']),
  ]

  return Promise.all(promises)
}

export const createReaction = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
  sampleName: string,
) => {
  const uniqueFolderName = getUniqueFolderName(
    baseFolderName,
    tree,
    baseFolderName,
  )
  const uniqueSampleName = getUniqueFolderName(sampleName, tree, sampleName)

  const promises = [
    createFolder(uniqueFolderName, uniqueFolderName, true),
    createFolder(
      `${uniqueFolderName}/${uniqueSampleName}`,
      uniqueSampleName,
      true,
    ),
    createSubFolders(`${uniqueFolderName}/${uniqueSampleName}`, [
      'structure',
      'analyses',
    ]),
  ]

  return Promise.all(promises)
}
