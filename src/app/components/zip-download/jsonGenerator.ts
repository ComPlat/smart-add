/* eslint-disable perfectionist/sort-objects */
import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import {
  attachmentTemplate,
  collectionTemplate,
  collectionsReactionTemplate,
  collectionsSampleTemplate,
  containerTemplate,
  moleculeNameTemplate,
  moleculeTemplate,
  reactionTemplate,
  sampleTemplate,
} from './templates'
import {
  attachmentSchema,
  containerSchema,
  moleculeNameSchema,
  moleculeSchema,
  reactionSchema,
  sampleSchema,
} from './zodSchemes'

const currentDate = new Date().toISOString()
const user_id = 'guest'

function generateUidMap(assignedFolders: ExtendedFolder[]) {
  return assignedFolders.reduce((uidMap: Record<string, string>, folder) => {
    uidMap[folder.uid] = v4()
    return uidMap
  }, {})
}

function getAncestry(
  folder: ExtendedFolder,
  allFolders: ExtendedFolder[],
  uidMap: Record<string, string>,
): string {
  if (folder.dtype === 'sample' || folder.dtype === 'reaction') return ''

  const pathComponents = folder.fullPath.split('/')
  const replacedPathComponents = pathComponents.reduce((acc, component) => {
    const matchingFolder = allFolders.find((f) => f.name === component)
    if (matchingFolder && matchingFolder !== folder) {
      const uid = uidMap[matchingFolder.uid]
      if (uid && !acc.includes(uid)) {
        acc.push(uid)
      }
    }
    return acc
  }, [] as string[])

  return replacedPathComponents.join('/')
}

export const generateExportJson = async (
  assignedFiles: ExtendedFile[],
  assignedFolders: ExtendedFolder[],
) => {
  const uniqueFoldersByPath = new Set()
  const processedFolders = [] as ExtendedFolder[]
  for (const folder of assignedFolders) {
    const fullPath = folder.fullPath

    if (!uniqueFoldersByPath.has(fullPath)) {
      uniqueFoldersByPath.add(fullPath)
      processedFolders.push(folder)
    }
  }
  const uidMap = generateUidMap(processedFolders)

  const collectionId = v4()
  const newCollection = {
    [collectionId]: {
      ...collectionTemplate,
      created_at: currentDate,
      updated_at: currentDate,
      label: 'Exported Collection',
      user_id,
    },
  }

  const newSamples = processedFolders
    .filter((folder) => folder.dtype === 'sample')
    .map((folder) => ({
      [uidMap[folder.uid]]: {
        ...sampleSchema.parse({
          ...sampleTemplate,
          ...folder.metadata,
          ancestry: getAncestry(folder, assignedFolders, uidMap),
          created_at: currentDate,
          updated_at: currentDate,
          user_id,
          name: folder.name,
        }),
      },
    }))
    .reduce((acc, sample) => ({ ...acc, ...sample }), {})

  const newCollectionsSamples = Object.entries(newSamples)
    .map(([sampleId]) => {
      const collectionsSampleId = v4()
      return {
        [collectionsSampleId]: {
          ...collectionsSampleTemplate,
          collection_id: collectionId,
          sample_id: sampleId,
        },
      }
    })
    .reduce((acc, collectionsSample) => ({ ...acc, ...collectionsSample }), {})

  const newReactions = processedFolders
    .filter((folder) => folder.dtype === 'reaction')
    .map((folder) => ({
      [uidMap[folder.uid]]: {
        ...reactionSchema.parse({
          ...reactionTemplate,
          ...folder.metadata,
          ancestry: getAncestry(folder, assignedFolders, uidMap),
          created_at: currentDate,
          updated_at: currentDate,
          user_id,
          name: folder.name,
        }),
      },
    }))
    .reduce((acc, reaction) => ({ ...acc, ...reaction }), {})

  const newCollectionsReactions = Object.entries(newReactions)
    .map(([reactionId]) => {
      const collectionsReactionId = v4()
      return {
        [collectionsReactionId]: {
          ...collectionsReactionTemplate,
          collection_id: collectionId,
          reaction_id: reactionId,
        },
      }
    })
    .reduce(
      (acc, collectionsReaction) => ({ ...acc, ...collectionsReaction }),
      {},
    )

  // TODO: DUMMY DATA
  const moleculeId = v4()
  const newMolecules = {
    [moleculeId]: {
      ...moleculeSchema.parse({
        ...moleculeTemplate,
        created_at: currentDate,
        updated_at: currentDate,
        molfile_version: 'dummy_molecule_version',
      }),
    },
  }

  // TODO: DUMMY DATA
  const moleculeNameId = v4()
  const newMoleculeNames = {
    [moleculeNameId]: {
      ...moleculeNameSchema.parse({
        ...moleculeNameTemplate,
        molecule_id: moleculeId,
        created_at: currentDate,
        updated_at: currentDate,
        name: 'dummy_molecule_name',
      }),
    },
  }

  // TODO: containable_id needs to be set
  const newContainers = processedFolders
    .map((folder) => ({
      [uidMap[folder.uid]]: {
        ...containerSchema.parse({
          ...containerTemplate,
          ...folder.metadata,
          ancestry: getAncestry(folder, assignedFolders, uidMap),
          user_id,
          name: folder.name,
          created_at: currentDate,
          updated_at: currentDate,
          description: '',
          parent_id: uidMap[folder.parentUid] || 'root',
        }),
      },
    }))
    .reduce((acc, container) => ({ ...acc, ...container }), {})

  const newAttachments = assignedFiles
    .map((file) => {
      const attachmentId = v4()
      return {
        [attachmentId]: {
          ...attachmentSchema.parse({
            ...attachmentTemplate,
            created_at: currentDate,
            updated_at: currentDate,
            attachable_id: uidMap[file.parentUid] || '',
            filename: file.name,
            identifier: file.uid,
            content_type: file.file.type,
            attachable_type: 'Container',
          }),
        },
      }
    })
    .reduce((acc, attachment) => ({ ...acc, ...attachment }), {})

  const exportJson = {
    Collection: {
      ...Object.assign({}, newCollection),
    },
    Sample: { ...Object.assign({}, newSamples) },
    CollectionsSample: {
      ...Object.assign({}, newCollectionsSamples),
    },
    Fingerprint: {},
    Molecule: {
      ...Object.assign({}, newMolecules),
    },
    MoleculeName: {
      ...Object.assign({}, newMoleculeNames),
    },
    Container: {
      ...Object.assign({}, newContainers),
    },
    Attachment: {
      ...Object.assign({}, newAttachments),
    },
    Reaction: {
      ...Object.assign({}, newReactions),
    },
    CollectionsReaction: {
      ...Object.assign({}, newCollectionsReactions),
    },
  }

  return exportJson
}
