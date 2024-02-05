import { FileNode } from '@/helper/types'

import {
  createFolder,
  createSubFolders,
  getUniqueFolderName,
} from './folderUtils'

const analyses = ['analysis_1', 'analysis_2']

export const createSample = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
) => {
  const uniqueFolderName = getUniqueFolderName(
    baseFolderName,
    tree,
    baseFolderName,
  )

  const parentFolder = await createFolder(
    uniqueFolderName,
    uniqueFolderName,
    true,
  )

  const promises = [
    createSubFolders(
      uniqueFolderName,
      ['structure', 'analyses'],
      parentFolder.uid,
    ),
    createSubFolders(
      `${uniqueFolderName}/analyses`,
      analyses,
      parentFolder.uid,
    ),
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

  await createFolder(uniqueFolderName, uniqueFolderName, true)

  const sampleFolder = await createFolder(
    `${uniqueFolderName}/${uniqueSampleName}`,
    uniqueSampleName,
    true,
  )

  const promises = [
    createSubFolders(
      `${uniqueFolderName}/${uniqueSampleName}`,
      ['structure', 'analyses'],
      sampleFolder.uid,
    ),
    createSubFolders(
      `${uniqueFolderName}/${uniqueSampleName}/analyses`,
      analyses,
      sampleFolder.uid,
    ),
  ]

  return Promise.all(promises)
}

export const createAnalysis = async (
  baseFolderName: string,
  fullPath: string,
  tree: Record<string, FileNode>,
) => {
  const uniqueFolderName = getUniqueFolderName(
    baseFolderName,
    tree,
    baseFolderName,
  )

  return await createFolder(
    `${fullPath}/${uniqueFolderName}`,
    uniqueFolderName,
    true,
  )
}
