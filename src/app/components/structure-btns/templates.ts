import { FileNode } from '@/helper/types'

import {
  moleculeTemplate,
  reactionTemplate,
  sampleTemplate,
} from '../zip-download/templates'
import {
  Container,
  Molecule,
  Reaction,
  Sample,
} from '../zip-download/zodSchemes'
import { datasetTemplate } from './../zip-download/templates'
import {
  createFolder,
  createSubFolders,
  getUniqueFolderName,
} from './folderUtils'
import { ReactionSchemeType } from '@/database/db'

const getMetadata = (
  parent_id: string,
  name: string,
  type: string,
  containable_type?: string,
): Container | Reaction | Sample | Molecule => {
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
    case 'molecule':
      return {
        ...moleculeTemplate,
        created_at: currentDate,
        updated_at: currentDate,
      } as Molecule
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
  fullPath?: string,
  parentUid?: string,
  reactionSchemeType:
    | 'none'
    | 'product'
    | 'solvent'
    | 'reactant'
    | 'startingMaterial' = 'product',
  customMoleculeMetadata?: Partial<Molecule>,
) => {
  const samplePath = fullPath ? `${fullPath}/${baseFolderName}` : baseFolderName
  const sampleParentUid = parentUid || ''

  const sampleFolder = await createFolder(
    samplePath,
    baseFolderName,
    true,
    sampleParentUid,
    getMetadata(sampleParentUid, baseFolderName, 'sample') as any,
    'sample',
    reactionSchemeType,
  )
  const analysesFolder = await createFolder(
    `${samplePath}/analyses`,
    'analyses',
    true,
    sampleFolder.uid,
    getMetadata(sampleFolder.uid, 'analyses', 'analyses') as any,
    'analyses',
  )

  // Merge custom molecule metadata with default template if provided
  const moleculeMetadata = customMoleculeMetadata
    ? {
        ...(getMetadata(
          sampleFolder.uid,
          'molecule',
          'molecule',
          '',
        ) as Molecule),
        ...customMoleculeMetadata,
      }
    : (getMetadata(sampleFolder.uid, 'molecule', 'molecule', '') as any)

  const moleculeFolder = await createSubFolders(
    samplePath,
    ['molecule'],
    sampleFolder.uid,
    [moleculeMetadata],
    Array(1).fill('molecule'),
  )
  const analysisFolders = await createSubFolders(
    `${samplePath}/analyses`,
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

  const promises = [moleculeFolder, analysisFolders, datasetFolders]

  return Promise.all(promises)
}

export const createReaction = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
  sampleName: string,
  reactionSchemeType: ReactionSchemeType = 'product',
) => {
  const reactionFolder = await createFolder(
    baseFolderName,
    baseFolderName,
    true,
    '',
    getMetadata('', baseFolderName, 'reaction') as any,
    'reaction',
  )
  const sampleFolder = await createFolder(
    `${baseFolderName}/${sampleName}`,
    sampleName,
    true,
    reactionFolder.uid,
    getMetadata(reactionFolder.uid, sampleName, 'sample', '') as any,
    'sample',
    reactionSchemeType,
  )
  const analysesFolder = await createFolder(
    `${baseFolderName}/${sampleName}/analyses`,
    'analyses',
    true,
    sampleFolder.uid,
    getMetadata(sampleFolder.uid, 'analyses', 'analyses', '') as any,
    'analyses',
  )

  const analysisFolders = await createSubFolders(
    `${baseFolderName}/${sampleName}/analyses`,
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

  // Create analyses folder for the reaction itself
  const reactionAnalysesFolder = await createFolder(
    `${baseFolderName}/analyses`,
    'analyses',
    true,
    reactionFolder.uid,
    getMetadata(reactionFolder.uid, 'analyses', 'analyses') as any,
    'analyses',
  )

  const reactionAnalysisFolders = await createSubFolders(
    `${baseFolderName}/analyses`,
    analyses,
    reactionAnalysesFolder.uid,
    analyses.map(
      (analysis) =>
        getMetadata(
          reactionAnalysesFolder.uid,
          analysis,
          'analysis',
          '',
        ) as any,
    ),
    Array(analyses.length).fill('analysis'),
  )

  const reactionDatasetFoldersPromises = reactionAnalysisFolders.map(
    async (folder) => {
      return await createSubFolders(
        `${folder.fullPath}`,
        datasets,
        folder.uid,
        datasets.map(
          (dataset) => getMetadata(folder.uid, dataset, 'dataset') as any,
        ),
        Array(datasets.length).fill('dataset'),
      )
    },
  )
  const reactionDatasetFolders = await Promise.all(
    reactionDatasetFoldersPromises,
  )

  const promises = [
    createSubFolders(
      `${baseFolderName}/${sampleName}`,
      ['molecule', 'analyses'],
      sampleFolder.uid,
      [
        getMetadata(sampleFolder.uid, 'molecule', 'molecule', '') as any,
        getMetadata(sampleFolder.uid, 'analyses', 'analyses') as any,
      ],
      ['molecule', 'analyses'],
    ),
    datasetFolders,
    reactionDatasetFolders,
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
    false,
    fullPath,
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
    false,
    fullPath,
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
