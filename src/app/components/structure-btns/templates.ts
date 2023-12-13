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
  await createFolder(uniqueFolderName, uniqueFolderName)
  await createSubFolders(uniqueFolderName, ['structure', 'analyses'])
}

export const createReaction = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
  sampleName: string,
) => {
  const uniqueFolderName = getUniqueFolderName(baseFolderName, tree)
  const uniqueSampleName = getUniqueFolderName(sampleName, tree)
  await createFolder(uniqueFolderName, uniqueFolderName)
  await createFolder(
    `${uniqueFolderName}/${uniqueSampleName}`,
    uniqueSampleName,
  )
  await createSubFolders(`${uniqueFolderName}/${uniqueSampleName}`, [
    'structure',
    'analyses',
  ])
}
