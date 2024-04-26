/* eslint-disable perfectionist/sort-objects */
import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { generateMd5Checksum } from '@/helper/cryptographicTools'
import { v4 } from 'uuid'

import {
  attachmentTemplate,
  collectionTemplate,
  collectionsReactionTemplate,
  collectionsSampleTemplate,
  containerTemplate,
  datasetTemplate,
  moleculeTemplate,
  reactionTemplate,
  sampleTemplate,
} from './templates'
import {
  Container,
  attachmentSchema,
  containerSchema,
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

function getAncestry(
  folder: ExtendedFolder,
  allFolders: ExtendedFolder[],
  uidMap: Record<string, string>,
): string {
  if (folder.dtype === 'sample' || folder.dtype === 'reaction') return ''

  const pathComponents = folder.fullPath.split('/').reverse()
  const { matchedUids } = getPathComponentsUids(
    pathComponents,
    folder,
    allFolders,
    uidMap,
  )

  const currentFolderUid = uidMap[folder.uid]
  const filteredUids = matchedUids.filter((uid) => uid !== currentFolderUid)

  return filteredUids.join('/')
}

function getPathComponentsUids(
  pathComponents: string[],
  currentFolder: ExtendedFolder,
  allFolders: ExtendedFolder[],
  uidMap: Record<string, string>,
) {
  return pathComponents.reduce(
    (acc, component) => {
      if (acc.shouldStop) return acc

      const matchingFolder = findMatchingFolder(
        component,
        allFolders,
        currentFolder,
      )

      if (matchingFolder) {
        updateMatchedUids(matchingFolder, acc.matchedUids, uidMap)
        // HINT: Stop at the sample level as ancestry does not contain both reaction and sample
        acc.shouldStop = matchingFolder.dtype === 'sample'
      }

      return acc
    },
    { matchedUids: [] as string[], shouldStop: false },
  )
}

function findMatchingFolder(
  component: string,
  allFolders: ExtendedFolder[],
  currentFolder: ExtendedFolder,
): ExtendedFolder | undefined {
  return allFolders.find(
    (folder) => folder.name === component && folder !== currentFolder,
  )
}

function updateMatchedUids(
  folder: ExtendedFolder,
  matchedUids: string[],
  uidMap: Record<string, string>,
) {
  const uid = uidMap[folder.uid]
  if (uid && !matchedUids.includes(uid)) {
    matchedUids.push(uid)
  }
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
          ancestry: getAncestry(folder, assignedFolders, uidMap),
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
          ancestry: getAncestry(folder, assignedFolders, uidMap),
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

  const uidToContainer = (() => {
    const containers: Record<string, Container> = {}

    for (const folder of processedFolders) {
      // HINT: Do not create containers for container types that are not allowed
      //        to be in the export.json file
      if (
        folder.metadata?.container_type === 'structure' ||
        folder.metadata?.container_type === 'folder'
      )
        continue

      const dtypeMapping = {
        sample: {
          containable_id: sampleReactionUidMap[folder.uid],
          containable_type: 'Sample',
        },
        reaction: {
          containable_id: sampleReactionUidMap[folder.uid],
          containable_type: 'Reaction',
        },
      }

      const { containable_id = null, containable_type = null } =
        dtypeMapping[folder.dtype as keyof typeof dtypeMapping] || {}

      const dataset = (folder: ExtendedFolder) => {
        return assignedFiles
          .filter((file) => file.parentUid === folder.uid)
          .map((file) => {
            const key = v4()

            return {
              [key]: {
                ...containerSchema.parse({
                  ...datasetTemplate,
                  ...file.metadata,
                  ancestry: `${uidMap[file.parentUid]}/${getAncestry(
                    folder,
                    assignedFolders,
                    uidMap,
                  )}`,
                  user_id,
                  created_at: currentDate,
                  updated_at: currentDate,
                  parent_id: uidMap[file.parentUid],
                }),
              },
            }
          })
      }

      const container = () => {
        const isAnalysis = folder.metadata?.container_type === 'analysis'

        return {
          [uidMap[folder.uid]]: {
            ...containerSchema.parse({
              ...containerTemplate,
              ...folder.metadata,
              ancestry: getAncestry(folder, assignedFolders, uidMap),
              containable_id,
              containable_type,
              user_id,
              name: folder.name,
              description: null,
              created_at: currentDate,
              updated_at: currentDate,
              parent_id: uidMap[folder.parentUid] || null,
              extended_metadata: isAnalysis
                ? {
                    content: '{"ops":[{"insert":"\\n"}]}',
                    index: '0',
                    report: 'true',
                  }
                : {},
            }),
          },
        }
      }

      Object.assign(containers, container(), ...dataset(folder))
    }

    return containers
  })()

  const uidToAttachment = await assignedFiles.reduce(async (acc, file) => {
    const attachableId =
      Object.entries(uidToContainer).find(
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

    return { ...(await acc), ...attachment }
  }, Promise.resolve({}))

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
