import { FileNode } from '@/helper/types'

import { reactionTemplate, sampleTemplate } from '../zip-download/templates'
import { Container, Reaction, Sample } from '../zip-download/zodSchemes'
import { datasetTemplate } from './../zip-download/templates'
import {
  createFolder,
  createSubFolders,
  getUniqueFolderName,
} from './folderUtils'

const getMetadata = (
  parent_id: string,
  name: string,
  type: string,
  containable_type?: string,
): Container | Reaction | Sample => {
  const currentDate = new Date().toISOString()

  switch (type) {
    case 'sample':
      return {
        ...sampleTemplate,
        created_at: currentDate,
        name,
        updated_at: currentDate,
      } as Sample
    case 'reaction':
      return {
        ...reactionTemplate,
        created_at: currentDate,
        name,
        updated_at: currentDate,
      } as Reaction
    case 'structure':
    case 'analyses':
      return {
        ancestry: parent_id,
        containable_id: '',
        containable_type: containable_type || '',
        container_type: type || '',
        created_at: currentDate,
        description: '',
        extended_metadata: {},
        name,
        parent_id,
        updated_at: currentDate,
      } as Container
    case 'analysis':
      return {
        ancestry: parent_id,
        containable_id: '',
        containable_type: containable_type || '',
        container_type: type || '',
        created_at: currentDate,
        description: '',
        extended_metadata: {
          status: null,
          kind: null,
        },
        name,
        parent_id,
        updated_at: currentDate,
      } as Container
    case 'dataset':
      return {
        ...datasetTemplate,
        ancestry: parent_id,
        created_at: currentDate,
        name,
        updated_at: currentDate,
      } as Container
    default:
      throw new Error(`Invalid type: ${type}`)
  }
}

const analyses = ['analysis_1', 'analysis_2']
const datasets = ['dataset_1']

export const createSample = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
) => {
  const uniqueFolderName = getUniqueFolderName(
    baseFolderName,
    tree,
    baseFolderName,
  )

  const sampleFolder = await createFolder(
    uniqueFolderName,
    baseFolderName,
    true,
    '',
    getMetadata('', uniqueFolderName, 'sample') as any,
    'sample',
    'product',
  )
  const analysesFolder = await createFolder(
    `${uniqueFolderName}/analyses`,
    'analyses',
    true,
    sampleFolder.uid,
    getMetadata(sampleFolder.uid, 'analyses', 'analyses') as any,
    'analyses',
  )
  const structureFolder = await createSubFolders(
    uniqueFolderName,
    ['structure'],
    sampleFolder.uid,
    [getMetadata(sampleFolder.uid, 'structure', 'structure', '') as any],
    Array(datasets.length).fill('structure'),
  )
  const analysisFolders = await createSubFolders(
    `${uniqueFolderName}/analyses`,
    analyses,
    analysesFolder.uid,
    analyses.map(
      (analysis) =>
        getMetadata(analysesFolder.uid, analysis, 'analysis', '') as any,
    ),
    Array(analyses.length).fill('analysis'),
  )

  const datasetFoldersPromises = analysisFolders.map(async (folder) => {
    return await createSubFolders(
      `${folder.fullPath}`,
      datasets,
      folder.uid,
      datasets.map(
        (dataset) => getMetadata(folder.uid, dataset, 'dataset') as any,
      ),
      Array(datasets.length).fill('dataset'),
    )
  })
  const datasetFolders = await Promise.all(datasetFoldersPromises)

  const promises = [structureFolder, analysisFolders, datasetFolders]

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

  const reactionFolder = await createFolder(
    uniqueFolderName,
    baseFolderName,
    true,
    '',
    getMetadata('', uniqueFolderName, 'reaction') as any,
    'reaction',
  )
  const sampleFolder = await createFolder(
    `${uniqueFolderName}/${sampleName}`,
    sampleName,
    true,
    reactionFolder.uid,
    getMetadata(reactionFolder.uid, sampleName, 'sample', '') as any,
    'sample',
    'product',
  )
  const analysesFolder = await createFolder(
    `${uniqueFolderName}/${sampleName}/analyses`,
    'analyses',
    true,
    sampleFolder.uid,
    getMetadata(sampleFolder.uid, 'analyses', 'analyses', '') as any,
    'analyses',
  )

  const analysisFolders = await createSubFolders(
    `${uniqueFolderName}/${sampleName}/analyses`,
    analyses,
    analysesFolder.uid,
    analyses.map(
      (analysis) =>
        getMetadata(analysesFolder.uid, analysis, 'analysis', '') as any,
    ),
    Array(analyses.length).fill('analysis'),
  )

  const datasetFoldersPromises = analysisFolders.map(async (folder) => {
    return await createSubFolders(
      `${folder.fullPath}`,
      datasets,
      folder.uid,
      datasets.map(
        (dataset) => getMetadata(folder.uid, dataset, 'dataset') as any,
      ),
      Array(datasets.length).fill('dataset'),
    )
  })
  const datasetFolders = await Promise.all(datasetFoldersPromises)

  const promises = [
    createSubFolders(
      `${uniqueFolderName}/${sampleName}`,
      ['structure', 'analyses'],
      sampleFolder.uid,
      [
        getMetadata(sampleFolder.uid, 'structure', 'structure', '') as any,
        getMetadata(sampleFolder.uid, 'analyses', 'analyses') as any,
      ],
      ['structure', 'analyses'],
    ),
    datasetFolders,
  ]

  return Promise.all(promises)
}

export const createAnalysis = async (
  baseFolderName: string,
  fullPath: string,
  tree: Record<string, FileNode>,
  parentUid: string,
) => {
  const uniqueFolderName = getUniqueFolderName(
    baseFolderName,
    tree,
    baseFolderName,
  )

  const analysisFolder = await createFolder(
    `${fullPath}/${uniqueFolderName}`,
    uniqueFolderName,
    true,
    parentUid,
    getMetadata(parentUid, uniqueFolderName, 'analysis', '') as any,
    'analysis',
  )

  const datasetFolders = await createSubFolders(
    `${fullPath}/${uniqueFolderName}`,
    datasets,
    analysisFolder.uid,
    datasets.map(
      (dataset) => getMetadata(analysisFolder.uid, dataset, 'dataset') as any,
    ),
    Array(datasets.length).fill('dataset'),
  )
  return Promise.all(datasetFolders)
}

export const createDataset = async (
  baseFolderName: string,
  fullPath: string,
  tree: Record<string, FileNode>,
  parentUid: string,
) => {
  const uniqueFolderName = getUniqueFolderName(
    baseFolderName,
    tree,
    baseFolderName,
  )

  const datasetFolder = await createFolder(
    `${fullPath}/${uniqueFolderName}`,
    uniqueFolderName,
    true,
    parentUid,
    getMetadata(parentUid, uniqueFolderName, 'dataset', '') as any,
    'dataset',
  )

  return datasetFolder
}
