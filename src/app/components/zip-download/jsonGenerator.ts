/* eslint-disable perfectionist/sort-objects */
import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { generateMd5Checksum } from '@/helper/cryptographicTools'
import { v4 } from 'uuid'

import { Ancestry } from './Ancestry'
import { Container } from './container'
import {
  attachmentTemplate,
  collectionTemplate,
  collectionsReactionTemplate,
  collectionsSampleTemplate,
  moleculeTemplate,
  reactionTemplate,
  sampleTemplate,
} from './templates'
import {
  Attachment,
  attachmentSchema,
  moleculeNameSchema,
  moleculeSchema,
  reactionSchema,
  sampleSchema,
} from './zodSchemes'

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

    const sample = {
      [sampleReactionUidMap[folder.uid]]: {
        ...sampleSchema.parse({
          ...sampleTemplate,
          ...folder.metadata,
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

    const reaction = {
      [sampleReactionUidMap[folder.uid]]: {
        ...reactionSchema.parse({
          ...reactionTemplate,
          ...folder.metadata,
          ancestry: Ancestry(folder, assignedFolders, uidMap),
          created_at: currentDate,
          updated_at: currentDate,
          user_id,
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

  const container = Container({
    assignedFiles,
    assignedFolders,
    currentDate,
    processedFolders,
    sampleReactionUidMap,
    uidMap,
    user_id,
  })

  const uidToAttachment = await assignedFiles.reduce(
    async (previousAttachment, file) => {
      const attachableId =
        Object.entries(Container).find(
          ([, container]) =>
            container.parent_id === uidMap[file.parentUid] &&
            container.container_type === 'dataset',
        )?.[0] || ''

      const attachmentId = v4()
      const filename = file.file.name
      const identifier = file.name.split('.')[0]
      const fileType = file.file.type
      const attachableType = 'Container'
      const checksum = await generateMd5Checksum(file.file)
      const key = file.uid
      const filesize = file.file.size

      const attachmentData = {
        id: `2/${identifier}`,
        metadata: {
          filename: `${key}${file.extension && `.${file.extension}`}`,
          md5: checksum,
          mime_type: fileType,
          size: filesize,
        },
        storage: 'store',
      }

      const attachment = {
        [attachmentId]: {
          ...attachmentSchema.parse({
            ...attachmentTemplate,
            created_at: currentDate,
            updated_at: currentDate,
            attachable_id: attachableId,
            filename,
            identifier,
            content_type: fileType,
            attachable_type: attachableType,
            checksum,
            aasm_state: 'non_jcamp',
            attachment_data: attachmentData,
            filesize,
            key,
            con_state: 9,
            edit_state: 0,
            created_by: '345c87e6-88a0-440a-a9c8-dcc78cc3f85b',
            created_for: '345c87e6-88a0-440a-a9c8-dcc78cc3f85b',
          }),
        },
      }

      return { ...previousAttachment, ...attachment }
    },
    {} as Promise<Attachment>,
  )

  const exportJson = {
    Collection: uidToCollection,
    Sample: uidToSample,
    CollectionsSample: uidToCollectionsSample,
    Fingerprint: {},
    Molecule: uidToMolecule,
    MoleculeName: uidToMoleculeName,
    Container: container,
    Attachment: uidToAttachment,
    Reaction: uidToReaction,
    CollectionsReaction: uidToCollectionsReaction,
  }

  return exportJson
}
