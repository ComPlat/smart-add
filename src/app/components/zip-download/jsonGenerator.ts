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
  const newCollection = assignedFolders
    .filter((folder) => folder.name.includes('Collection_'))
    .map((folder) => {
      const collection_id = folder.uid
      return {
        [collection_id]: {
          ...collectionSchema.parse({
            ...collectionTemplate,
            user_id,
            label: folder.name,
            created_at: currentDate,
            updated_at: currentDate,
          }),
        },
      }
    })
    .reduce((acc, collection) => ({ ...acc, ...collection }), {})

  const newSamples = assignedFolders
    .filter((folder) => folder.name.includes('Sample_'))
    .map((folder) => {
      const sample_id = v4()
      return {
        [sample_id]: {
          ...sampleSchema.parse({
            ...sampleTemplate,
            user_id,
            name: folder.name,
            created_at: currentDate,
            updated_at: currentDate,
          }),
        },
      }
    })
    .reduce((acc, sample) => ({ ...acc, ...sample }), {})

  const newReactions = assignedFolders
    .filter((folder) => folder.name.includes('Reaction_'))
    .map((folder) => {
      const reaction_id = v4()
      return {
        [reaction_id]: {
          ...reactionSchema.parse({
            ...reactionTemplate,
            user_id,
            name: folder.name,
            created_at: currentDate,
            updated_at: currentDate,
          }),
        },
      }
    })
    .reduce((acc, reaction) => ({ ...acc, ...reaction }), {})

  const exportJson = {
    ...initialJson,
    Collection: {
      ...initialJson.Collection,
      ...Object.assign({}, newCollection),
    },
    Sample: { ...initialJson.Sample, ...Object.assign({}, newSamples) },
    Reaction: {
      ...initialJson.Reaction,
      ...Object.assign({}, newReactions),
    },
  }

  console.log(exportJson)
}
