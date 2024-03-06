import { FileNode } from '@/helper/types'

import { Container } from '../zip-download/zodSchemes'
import {
  createFolder,
  createSubFolders,
  getUniqueFolderName,
} from './folderUtils'

const getContainerMetadata = (
  parent_id: string,
  name: string,
  container_type: string,
  description: string,
  extended_metadata: null | object,
): Container => ({
  ancestry: parent_id,
  containable_id: null,
  containable_type: null,
  container_type,
  created_at: new Date().toISOString(),
  description,
  extended_metadata,
  name,
  parent_id,
  updated_at: new Date().toISOString(),
})

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

  const sampleFolder = await createFolder(
    uniqueFolderName,
    baseFolderName,
    true,
    '',
    getContainerMetadata('', uniqueFolderName, 'sample', '', null),
  )
  const analysesFolder = await createFolder(
    `${uniqueFolderName}/analyses`,
    'analyses',
    true,
    '',
    getContainerMetadata(sampleFolder.uid, 'analyses', 'analyses', '', null),
  )

  const promises = [
    createSubFolders(uniqueFolderName, ['structure'], sampleFolder.uid, [
      getContainerMetadata(
        sampleFolder.uid,
        'structure',
        'structure',
        '',
        null,
      ),
    ]),
    createSubFolders(
      `${uniqueFolderName}/analyses`,
      analyses,
      analysesFolder.uid,
      analyses.map((analysis) =>
        getContainerMetadata(
          analysesFolder.uid,
          analysis,
          'analysis',
          '',
          null,
        ),
      ),
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

  const reactionFolder = await createFolder(
    uniqueFolderName,
    baseFolderName,
    true,
    '',
    getContainerMetadata('', uniqueFolderName, 'reaction', '', null),
  )
  const sampleFolder = await createFolder(
    `${uniqueFolderName}/${sampleName}`,
    sampleName,
    true,
    '',
    getContainerMetadata(reactionFolder.uid, sampleName, 'sample', '', null),
  )
  const analysesFolder = await createFolder(
    `${uniqueFolderName}/${sampleName}/analyses`,
    'analyses',
    true,
    '',
    getContainerMetadata(sampleFolder.uid, 'analyses', 'analyses', '', null),
  )

  const promises = [
    createSubFolders(
      `${uniqueFolderName}/${sampleName}`,
      ['structure', 'analyses'],
      sampleFolder.uid,
      [
        getContainerMetadata(
          sampleFolder.uid,
          'structure',
          'structure',
          '',
          null,
        ),
        getContainerMetadata(
          sampleFolder.uid,
          'analyses',
          'analyses',
          '',
          null,
        ),
      ],
    ),
    createSubFolders(
      `${uniqueFolderName}/${sampleName}/analyses`,
      analyses,
      analysesFolder.uid,
      analyses.map((analysis) =>
        getContainerMetadata(
          analysesFolder.uid,
          analysis,
          'analysis',
          '',
          null,
        ),
      ),
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
  const analysisName = 'analysis'

  return await createFolder(
    `${fullPath}/${uniqueFolderName}`,
    uniqueFolderName,
    true,
    '',
    getContainerMetadata('', uniqueFolderName, analysisName, '', null),
  )
}
