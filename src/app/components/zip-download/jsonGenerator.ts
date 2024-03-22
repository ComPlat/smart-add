import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import {
  attachmentTemplate,
  collectionTemplate,
  collectionsReactionTemplate,
  collectionsSampleTemplate,
  containerTemplate,
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
  collectionSchema,
} from './zodSchemes'

const currentDate = new Date().toISOString()
const user_id = 'guest'

interface KeyValuePair<T> {
  [key: string]: T
}

/* eslint-disable perfectionist/sort-objects */
const initialJson = {
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
}

export async function generateExportJson(
  assignedFiles: ExtendedFile[],
  assignedFolders: ExtendedFolder[],
) {
  const exportJson = {
    ...initialJson,
  }

  const uidMap = {} as Record<string, string>

  const collectionId = v4()
  const collectionData = {
    ...collectionTemplate,
    created_at: currentDate,
    updated_at: currentDate,
    user_id,
  }
  exportJson.Collection[collectionId] = collectionSchema.parse(collectionData)

  const uniqueFoldersByPath = new Set()
  const processedFolders = [] as ExtendedFolder[]

  for (const folder of assignedFolders) {
    const fullPath = folder.fullPath

    if (!uniqueFoldersByPath.has(fullPath)) {
      uniqueFoldersByPath.add(fullPath)
      processedFolders.push(folder)
    }
  }

  processedFolders.forEach((folder) => {
    const isReaction = folder.dtype === 'reaction'
    const isSample = folder.dtype === 'sample'
    const isContainer = folder.dtype === 'folder'

    if (isReaction) {
      const reactionId = v4()
      uidMap[folder.uid] = reactionId
      const reactionData = {
        ...reactionTemplate,
        ...folder.metadata,
        created_at: currentDate,
        updated_at: currentDate,
        user_id,
      }

      exportJson.Reaction[reactionId] = reactionData

      const collectionsReactionId = v4()
      const collectionsReactionData = {
        ...collectionsReactionTemplate,
        collection_id: collectionId,
        reaction_id: reactionId,
      }

      exportJson.CollectionsReaction[collectionsReactionId] =
        collectionsReactionData
    } else if (isSample) {
      const sampleId = v4()
      uidMap[folder.uid] = sampleId
      const sampleData = {
        ...sampleTemplate,
        ...folder.metadata,
        created_at: currentDate,
        updated_at: currentDate,
        user_id,
      }

      exportJson.Sample[sampleId] = sampleData

      const collectionsSampleId = v4()
      const collectionsSampleData = {
        ...collectionsSampleTemplate,
        collection_id: collectionId,
        sample_id: sampleId,
      }

      exportJson.CollectionsSample[collectionsSampleId] = collectionsSampleData
    } else if (isContainer) {
      const containerId = v4()
      uidMap[folder.uid] = containerId
      const containerData = {
        ...containerTemplate,
        ...folder.metadata,
        created_at: currentDate,
        updated_at: currentDate,
        user_id,
      }

      exportJson.Container[containerId] = containerData
    }
  })

  assignedFiles.forEach((file) => {
    const attachmentId = v4()
    const attachmentData = {
      ...attachmentTemplate,
      created_at: currentDate,
      updated_at: currentDate,
      attachable_id:
        uidMap[
          processedFolders.find((folder) => folder.uid === file.parentUid)
            ?.uid || ''
        ],
      filename: file.name,
      identifier: file.uid,
      content_type: file.file.type,
      attachable_type: 'Container',
    } as Attachment

    exportJson.Attachment[attachmentId] = attachmentData
  })

  return exportJson
}
