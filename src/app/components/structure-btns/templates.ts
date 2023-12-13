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
  const uniqueFolderName = getUniqueFolderName(baseFolderName, tree)

  const promises = [
    createFolder(uniqueFolderName, uniqueFolderName),
    createSubFolders(uniqueFolderName, ['structure', 'analyses']),
  ]

  await Promise.all(promises)
}

export const createReaction = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
  sampleName: string,
) => {
  const uniqueFolderName = getUniqueFolderName(baseFolderName, tree)
  const uniqueSampleName = getUniqueFolderName(sampleName, tree)

  const promises = [
    createFolder(uniqueFolderName, uniqueFolderName),
    createFolder(`${uniqueFolderName}/${uniqueSampleName}`, uniqueSampleName),
    createSubFolders(`${uniqueFolderName}/${uniqueSampleName}`, [
      'structure',
      'analyses',
    ]),
  ]

  await Promise.all(promises)
}
