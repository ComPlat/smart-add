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
  Attachment,
  Collection,
  CollectionsReaction,
  CollectionsSample,
  Container,
  Fingerprint,
  Molecule,
  MoleculeName,
  Reaction,
  ReactionSample,
  Sample,
  attachmentSchema,
  containerSchema,
  moleculeNameSchema,
  moleculeSchema,
  reactionSchema,
  sampleSchema,
} from './zodSchemes'

const currentDate = new Date().toISOString()
const user_id = 'guest'

interface KeyValuePair<T> {
  [key: string]: T
}

const getInitialJson = () => ({
  /* eslint-disable perfectionist/sort-objects */
  Collection: {} as KeyValuePair<Collection>,
  Sample: {} as KeyValuePair<Sample>,
  CollectionsSample: {} as KeyValuePair<CollectionsSample>,
  Fingerprint: {} as KeyValuePair<Fingerprint>,
  Molecule: {} as KeyValuePair<Molecule>,
  MoleculeName: {} as KeyValuePair<MoleculeName>,
  Container: {} as KeyValuePair<Container>,
  Attachment: {} as KeyValuePair<Attachment>,
  Reaction: {} as KeyValuePair<Reaction>,
  CollectionsReaction: {} as KeyValuePair<CollectionsReaction>,
  ReactionsStartingMaterialSample: {} as KeyValuePair<ReactionSample>,
  ReactionsReactantSample: {} as KeyValuePair<ReactionSample>,
  ReactionsProductSample: {} as KeyValuePair<ReactionSample>,
})

export const generateExportJson = async (
  assignedFiles: ExtendedFile[],
  assignedFolders: ExtendedFolder[],
) => {
  const initialJson = getInitialJson()
  const uidMap = {} as Record<string, string>

  const uniqueFoldersByPath = new Set()
  const processedFolders = [] as ExtendedFolder[]
  for (const folder of assignedFolders) {
    const fullPath = folder.fullPath

    if (!uniqueFoldersByPath.has(fullPath)) {
      uniqueFoldersByPath.add(fullPath)
      processedFolders.push(folder)
    }
  }

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
    .map((folder) => {
      const sampleId = v4()
      uidMap[folder.uid] = sampleId
      return {
        [sampleId]: {
          ...sampleSchema.parse({
            ...sampleTemplate,
            ...folder.metadata,
            created_at: currentDate,
            updated_at: currentDate,
            user_id,
            name: folder.name,
          }),
        },
      }
    })
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
    .map((folder) => {
      const reactionId = v4()
      uidMap[folder.uid] = reactionId
      return {
        [reactionId]: {
          ...reactionSchema.parse({
            ...reactionTemplate,
            ...folder.metadata,
            created_at: currentDate,
            updated_at: currentDate,
            user_id,
            name: folder.name,
          }),
        },
      }
    })
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
    .map((folder) => {
      const containerId = v4()
      return {
        [containerId]: {
          ...containerSchema.parse({
            ...containerTemplate,
            ...folder.metadata,
            user_id,
            name: folder.name,
            created_at: currentDate,
            updated_at: currentDate,
            container_type: folder.dtype,
            description: '',
            parent_id: uidMap[folder.parentUid] || 'root',
          }),
        },
      }
    })
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
    ...initialJson,
    Collection: {
      ...initialJson.Collection,
      ...Object.assign({}, newCollection),
    },
    Sample: { ...initialJson.Sample, ...Object.assign({}, newSamples) },
    CollectionsSample: {
      ...initialJson.CollectionsSample,
      ...Object.assign({}, newCollectionsSamples),
    },
    Fingerprint: {},
    Molecule: {
      ...initialJson.Molecule,
      ...Object.assign({}, newMolecules),
    },
    MoleculeName: {
      ...initialJson.MoleculeName,
      ...Object.assign({}, newMoleculeNames),
    },
    Container: {
      ...initialJson.Container,
      ...Object.assign({}, newContainers),
    },
    Attachment: {
      ...initialJson.Attachment,
      ...Object.assign({}, newAttachments),
    },
    Reaction: {
      ...initialJson.Reaction,
      ...Object.assign({}, newReactions),
    },
    CollectionsReaction: {
      ...initialJson.CollectionsReaction,
      ...Object.assign({}, newCollectionsReactions),
    },
  }

  return exportJson
}
