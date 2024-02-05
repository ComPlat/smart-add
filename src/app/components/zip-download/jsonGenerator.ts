import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import {
  collectionTemplate,
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
  reactionSchema,
  sampleSchema,
} from './zodSchemata'

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
  const newCollection = assignedFolders.reduce((acc, folder) => {
    if (folder.name.includes('Collection_')) {
      acc[v4()] = {
        ...collectionSchema.parse({
          ...collectionTemplate,
          user_id,
          label: folder.name,
          created_at: currentDate,
          updated_at: currentDate,
        }),
      }
    }
    return acc
  }, {} as KeyValuePair<Collection>)

  const newSamples = assignedFolders.reduce((acc, folder) => {
    if (folder.name.includes('Sample_')) {
      acc[v4()] = {
        ...sampleSchema.parse({
          ...sampleTemplate,
          user_id,
          name: folder.name,
          created_at: currentDate,
          updated_at: currentDate,
        }),
      }
    }
    return acc
  }, {} as KeyValuePair<Sample>)

  const newReactions = assignedFolders.reduce((acc, folder) => {
    if (folder.name.includes('Reaction_')) {
      acc[v4()] = {
        ...reactionSchema.parse({
          ...reactionTemplate,
          user_id,
          name: folder.name,
          created_at: currentDate,
          updated_at: currentDate,
        }),
      }
    }
    return acc
  }, {} as KeyValuePair<Reaction>)

  const exportJson = {
    ...initialJson,
    Collection: {
      ...initialJson.Collection,
      ...newCollection,
    },
    Sample: {
      ...initialJson.Sample,
      ...newSamples,
    },
    Reaction: {
      ...initialJson.Reaction,
      ...newReactions,
    },
  }

  return exportJson
}
