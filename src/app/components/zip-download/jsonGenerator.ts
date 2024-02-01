import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import {
  collectionTemplate,
  fingerprintTemplate,
  reactionSampleTemplate,
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
} from './types'

const currentDate = new Date().toISOString()
const user_id = 'guest'

/* eslint-disable perfectionist/sort-objects */
const initialJson = {
  Collection: {} as { [key: string]: Collection },
  Sample: {} as { [key: string]: Sample },
  CollectionsSample: {} as { [key: string]: CollectionsSample },
  Fingerprint: {} as { [key: string]: Fingerprint },
  Molecule: {} as { [key: string]: Molecule },
  MoleculeName: {} as { [key: string]: MoleculeName },
  Container: {} as { [key: string]: Container },
  Attachment: {} as { [key: string]: Attachment },
  Reaction: {} as { [key: string]: Reaction },
  CollectionsReaction: {} as { [key: string]: CollectionsReaction },
  ReactionsStartingMaterialSample: {} as { [key: string]: ReactionSample },
  ReactionsReactantSample: {} as { [key: string]: ReactionSample },
  ReactionsProductSample: {} as { [key: string]: ReactionSample },
}

export async function generateExportJson(
  assignedFiles: ExtendedFile[],
  assignedFolders: ExtendedFolder[],
) {
  const exportJson = { ...initialJson }

  const collection_id = v4()

  exportJson.Collection[collection_id] = {
    ...(collectionTemplate as unknown as Collection),
    ...{ user_id, created_at: currentDate, updated_at: currentDate },
  }

  for (const folder of assignedFolders) {
    if (folder.name.includes('Sample_')) {
      exportJson.Sample[folder.uid] = {
        ...(sampleTemplate as unknown as Sample),
        ...{
          user_id,
          name: folder.name,
          created_at: currentDate,
          updated_at: currentDate,
        }, // HINT: Fill with metadata object of sample
      }
      exportJson.CollectionsSample[collection_id] = {
        collection_id,
        sample_id: folder.uid,
        deleted_at: null,
      }
      const fingerprint_id = v4()
      exportJson.Fingerprint[fingerprint_id] = {
        ...(fingerprintTemplate as unknown as Fingerprint),
        ...{ created_at: currentDate, updated_at: currentDate }, // HINT: Fill with metadata
      }
      exportJson.Sample[folder.uid].fingerprint_id = fingerprint_id

      // TODO: Molecule
      // TODO: MoleculeName
      // TODO: Container
      // TODO: Attachment
    }
    if (folder.name.includes('Reaction_')) {
      exportJson.Reaction[folder.uid] = {
        ...(collectionTemplate as unknown as Reaction),
        ...{
          name: folder.name,
          created_at: currentDate,
          updated_at: currentDate,
          user_id,
        }, // HINT: Fill with metadata object of reaction
      }
      exportJson.CollectionsReaction[collection_id] = {
        collection_id,
        reaction_id: folder.uid,
        deleted_at: null,
      }

      const reactions_starting_material_sample_id = v4()
      exportJson.ReactionsStartingMaterialSample[
        reactions_starting_material_sample_id
      ] = {
        ...(reactionSampleTemplate as unknown as ReactionSample),
        ...{
          reaction_id: folder.uid,
          sample_id: 'linked_sample_id', // TODO: sample_id not yet linked in data structure
        },
      }

      const reactions_reactant_sample_id = v4()
      exportJson.ReactionsReactantSample[reactions_reactant_sample_id] = {
        ...(reactionSampleTemplate as unknown as ReactionSample),
        ...{
          reaction_id: folder.uid,
          sample_id: 'linked_sample_id', // TODO: sample_id not yet linked in data structure
        },
      }

      // HINT: Not sure if this is the correct way to do it
      const reactions_product_sample_id = v4()
      exportJson.ReactionsProductSample[reactions_product_sample_id] = {
        ...(reactionSampleTemplate as unknown as ReactionSample),
        ...{
          reaction_id: folder.uid,
          sample_id: 'linked_sample_id', // TODO: sample_id not yet linked in data structure
        },
      }
    }
  }

  // HINT: Remove empty objects
  // const filteredExportJson = Object.fromEntries(
  //   Object.entries(exportJson).filter(
  //     ([, value]) => Object.keys(value).length > 0,
  //   ),
  // )
  // console.log(filteredExportJson)

  console.log(exportJson)
}
