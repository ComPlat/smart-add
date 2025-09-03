import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import { Ancestry } from './Ancestry'
import { Attachment } from './attachment'
import { Container } from './container'
import { ReactionsProductSample } from './reaction-scheme-types/reactionProductSample'
import { ReactionsReactantSample } from './reaction-scheme-types/reactionReactantSample'
import { ReactionsStartingMaterialSample } from './reaction-scheme-types/reactionStartingMaterialSample'
import { ReactionsSolventSample } from './reaction-scheme-types/reactionsSolventSample'
import {
  collectionTemplate,
  collectionsReactionTemplate,
  collectionsSampleTemplate,
  moleculeTemplate,
  reactionTemplate,
  sampleTemplate,
} from './templates'
import {
  moleculeNameSchema,
  moleculeSchema,
  reactionSchema,
  sampleSchema,
} from './zodSchemes'
import { formatForExport } from '@/helper/fieldValidation'

const currentDate = new Date().toISOString()
const user_id = null

function generateUidMap(assignedFolders: ExtendedFolder[]) {
  return assignedFolders.reduce((uidMap: Record<string, string>, folder) => {
    return {
      ...uidMap,
      [folder.uid]: v4(),
    }
  }, {})
}

function generateSampleReactionUidMap(assignedFolders: ExtendedFolder[]) {
  return assignedFolders.reduce((uidMap: Record<string, string>, folder) => {
    if (folder.dtype === 'sample' || folder.dtype === 'reaction') {
      return {
        ...uidMap,
        [folder.uid]: v4(),
      }
    }
    return uidMap
  }, {})
}

export const generateExportJson = async (
  assignedFiles: ExtendedFile[],
  assignedFolders: ExtendedFolder[],
) => {
  const processedFolders = assignedFolders.reduce((acc, assignedFolder) => {
    const existingFolder = acc.find(
      (processedFolder) => processedFolder.fullPath === assignedFolder.fullPath,
    )
    if (!existingFolder) acc.push(assignedFolder)
    return acc
  }, [] as ExtendedFolder[])
  const uidMap = generateUidMap(processedFolders)
  const sampleReactionUidMap = generateSampleReactionUidMap(processedFolders)

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

  const moleculeId = v4()
  const uidToMolecule = {
    [moleculeId]: {
      ...moleculeSchema.parse({
        ...moleculeTemplate,
        inchikey: 'DUMMY',
        created_at: currentDate,
        updated_at: currentDate,
        is_partial: false,
      }),
    },
  }

  // TODO: DUMMY DATA
  const moleculeNameId = v4()
  const uidToMoleculeName = {
    [moleculeNameId]: {
      ...moleculeNameSchema.parse({
        molecule_id: moleculeId,
        user_id: null,
        description: 'iupac_name',
        name: 'N-[1-amyl-7-(trifluoromethyl)indazol-3-yl]-2-phenyl-acetamide',
        deleted_at: null,
        created_at: '2019-07-07T01:18:35.740Z',
        updated_at: '2019-07-07T01:18:35.740Z',
      }),
    },
  }

  const uidToSample = processedFolders.reduce((acc, folder) => {
    if (folder.dtype !== 'sample') return acc

    // Format temperature fields for export (append ..Infinity to single numbers)
    const formattedMetadata = { ...folder.metadata }
    if (formattedMetadata.boiling_point) {
      formattedMetadata.boiling_point = formatForExport(
        'boiling_point',
        formattedMetadata.boiling_point,
      )
    }
    if (formattedMetadata.melting_point) {
      formattedMetadata.melting_point = formatForExport(
        'melting_point',
        formattedMetadata.melting_point,
      )
    }

    const sample = {
      [sampleReactionUidMap[folder.uid]]: {
        ...sampleSchema.parse({
          ...sampleTemplate,
          ...formattedMetadata,
          ancestry: Ancestry(folder, assignedFolders, uidMap),
          created_at: currentDate,
          updated_at: currentDate,
          molecule_id: moleculeId,
          name: 'decoupled sample',
          sum_formula: 'undefined structure',
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

    const parsedReaction = reactionSchema.parse({
      ...reactionTemplate,
      ...folder.metadata,
      ancestry: Ancestry(folder, assignedFolders, uidMap),
      created_at: currentDate,
      updated_at: currentDate,
      user_id,
    })

    // Convert description from string to Delta format for reactions AFTER parsing
    const reactionForExport = { ...parsedReaction }
    if (reactionForExport.description && typeof reactionForExport.description === 'string') {
      ;(reactionForExport as any).description = {
        ops: [{ insert: reactionForExport.description + '\n' }]
      }
    }

    const reaction = {
      [sampleReactionUidMap[folder.uid]]: reactionForExport,
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
  const container = Container({
    assignedFolders,
    currentDate,
    processedFolders,
    sampleReactionUidMap,
    uidMap,
    user_id,
  })

  const attachments = await Attachment({
    assignedFiles,
    container,
    currentDate,
    uidMap,
  })

  const startingMaterials = ReactionsStartingMaterialSample({
    assignedFolders,
    sampleReactionUidMap,
  })

  const reactants = ReactionsReactantSample({
    assignedFolders,
    sampleReactionUidMap,
  })

  const products = ReactionsProductSample({
    assignedFolders,
    sampleReactionUidMap,
  })

  const solvents = ReactionsSolventSample({
    assignedFolders,
    sampleReactionUidMap,
  })

  const exportJson = {
    Collection: uidToCollection,
    Sample: uidToSample,
    CollectionsSample: uidToCollectionsSample,
    Fingerprint: {},
    Molecule: uidToMolecule,
    MoleculeName: uidToMoleculeName,
    Container: container,
    Attachment: attachments,
    Reaction: uidToReaction,
    CollectionsReaction: uidToCollectionsReaction,
    ReactionsStartingMaterialSample: startingMaterials,
    ReactionsReactantSample: reactants,
    ReactionsProductSample: products,
    ReactionsSolventSample: solvents,
  }

  return exportJson
}
