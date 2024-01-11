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

  const promises = [
    createFolder(uniqueFolderName, uniqueFolderName),
    createSubFolders(uniqueFolderName, ['structure', 'analyses']),
    createSubFolders(`${uniqueFolderName}/analyses`, analyses),
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
    createFolder(uniqueFolderName, uniqueFolderName),
    createFolder(`${uniqueFolderName}/${uniqueSampleName}`, uniqueSampleName),
    createSubFolders(`${uniqueFolderName}/${uniqueSampleName}`, [
      'structure',
      'analyses',
    ]),
    createSubFolders(
      `${uniqueFolderName}/${uniqueSampleName}/analyses`,
      analyses,
    ),
  ]

  return Promise.all(promises)
}

export const createAnalysis = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
) => {
  const uniqueFolderName = getUniqueFolderName(
    baseFolderName,
    tree,
    baseFolderName,
  )

  const promises = [createFolder(uniqueFolderName, uniqueFolderName)]

  return Promise.all(promises)
}
