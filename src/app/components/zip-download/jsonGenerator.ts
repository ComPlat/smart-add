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
  const uniqueFoldersByPath = new Set(
    assignedFolders.map((folder) => folder.fullPath),
  )
  const processedFolders = assignedFolders.filter((folder) =>
    uniqueFoldersByPath.has(folder.fullPath),
  )
  const uidMap = generateUidMap(processedFolders)

  const collectionId = v4()
  const uidToCollection = {
    [collectionId]: {
      ...collectionTemplate,
      created_at: currentDate,
      updated_at: currentDate,
      label: 'Exported Collection',
      user_id,
    },
  }

  const uidToSample = processedFolders.reduce((acc, folder) => {
    if (folder.dtype !== 'sample') return acc
    const sample = {
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
    }
    return { ...acc, ...sample }
  }, {})

  const uidToCollectionsSample = Object.entries(uidToSample).reduce(
    (acc, [sampleId]) => {
      const collectionsSampleId = v4()
      return {
        ...acc,
        [collectionsSampleId]: {
          ...collectionsSampleTemplate,
          collection_id: collectionId,
          sample_id: sampleId,
        },
      }
    },
    {},
  )

  const uidToReaction = processedFolders.reduce((acc, folder) => {
    if (folder.dtype !== 'reaction') return acc
    const reaction = {
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
    }
    return { ...acc, ...reaction }
  }, {})

  const uidToCollectionsReaction = Object.entries(uidToReaction).reduce(
    (acc, [reactionId]) => {
      const collectionsReactionId = v4()
      return {
        ...acc,
        [collectionsReactionId]: {
          ...collectionsReactionTemplate,
          collection_id: collectionId,
          reaction_id: reactionId,
        },
      }
    },
    {},
  )

  // TODO: DUMMY DATA
  const moleculeId = v4()
  const uidToMolecule = {
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
  const uidToMoleculeName = {
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

  const uidToContainer = processedFolders.reduce((acc, folder) => {
    const dtypeMapping = {
      sample: {
        containable_id: uidMap[folder.uid],
        containable_type: 'Sample',
      },
      reaction: {
        containable_id: uidMap[folder.uid],
        containable_type: 'Reaction',
      },
    }

    const { containable_id = null, containable_type = null } =
      dtypeMapping[folder.dtype as keyof typeof dtypeMapping] || {}

    const container = {
      [uidMap[folder.uid]]: {
        ...containerSchema.parse({
          ...containerTemplate,
          ...folder.metadata,
          ancestry: getAncestry(folder, assignedFolders, uidMap),
          containable_id,
          containable_type,
          user_id,
          name: folder.name,
          created_at: currentDate,
          updated_at: currentDate,
          description: '',
          parent_id: uidMap[folder.parentUid] || 'root',
        }),
      },
    }
    return { ...acc, ...container }
  }, {})

  const uidToAttachment = assignedFiles.reduce((acc, file) => {
    const attachmentId = v4()
    const attachment = {
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
    return { ...acc, ...attachment }
  }, {})

  const exportJson = {
    Collection: uidToCollection,
    Sample: uidToSample,
    CollectionsSample: uidToCollectionsSample,
    Fingerprint: {},
    Molecule: uidToMolecule,
    MoleculeName: uidToMoleculeName,
    Container: uidToContainer,
    Attachment: uidToAttachment,
    Reaction: uidToReaction,
    CollectionsReaction: uidToCollectionsReaction,
  }

  return exportJson
}
