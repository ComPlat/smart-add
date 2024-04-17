/* eslint-disable perfectionist/sort-objects */
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
    uidMap[folder.uid] = v4()
    return uidMap
  }, {})
}

function generateSampleReactionUidMap(assignedFolders: ExtendedFolder[]) {
  return assignedFolders.reduce((uidMap: Record<string, string>, folder) => {
    if (folder.dtype === 'sample' || folder.dtype === 'reaction') {
      uidMap[folder.uid] = v4()
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
  return allFolders.find((f) => f.name === component && f !== currentFolder)
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

  // TODO: DUMMY DATA
  const moleculeId = v4()
  const uidToMolecule = {
    [moleculeId]: {
      ...moleculeSchema.parse({
        inchikey: 'XPVNJWFRESHULB-UHFFFAOYSA-N',
        inchistring:
          'InChI=1S/C21H22F3N3O/c1-2-3-7-13-27-19-16(11-8-12-17(19)21(22,23)24)20(26-27)25-18(28)14-15-9-5-4-6-10-15/h4-6,8-12H,2-3,7,13-14H2,1H3,(H,25,26,28)',
        density: 0.0,
        molecular_weight: 389.41408959999984,
        molfile:
          '\n  Ketcher 02131709132D 1   1.00000     0.00000     0\n\n 28 30  0     0  0            999 V2000\n    6.6500   -4.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.5160   -4.9750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.5160   -5.9750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.6500   -6.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7840   -5.9750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7840   -4.9750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.4942   -4.7670    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.9942   -5.6331    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    8.3250   -6.3762    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    6.6500   -7.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7840   -7.9750    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    7.5160   -7.9750    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    7.5160   -6.9750    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    8.5126   -7.3585    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.9009   -3.8535    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    9.8955   -3.7489    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.3022   -2.8354    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   10.4832   -4.5580    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.4778   -4.4534    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.9778   -3.5874    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   12.9778   -3.5874    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   13.4778   -4.4534    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   12.9778   -5.3194    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.9778   -5.3194    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.4570   -7.6872    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.6445   -8.6695    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.5890   -8.9982    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.7765   -9.9804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0     0  0\n  2  3  2  0     0  0\n  3  4  1  0     0  0\n  4  5  2  0     0  0\n  5  6  1  0     0  0\n  6  1  2  0     0  0\n  2  7  1  0     0  0\n  7  8  2  0     0  0\n  8  9  1  0     0  0\n  9  3  1  0     0  0\n  4 10  1  0     0  0\n 10 11  1  0     0  0\n 10 12  1  0     0  0\n 10 13  1  0     0  0\n  9 14  1  0     0  0\n  7 15  1  0     0  0\n 15 16  1  0     0  0\n 16 17  2  0     0  0\n 16 18  1  0     0  0\n 18 19  1  0     0  0\n 19 20  1  0     0  0\n 20 21  2  0     0  0\n 21 22  1  0     0  0\n 22 23  2  0     0  0\n 23 24  1  0     0  0\n 24 19  2  0     0  0\n 14 25  1  0     0  0\n 25 26  1  0     0  0\n 26 27  1  0     0  0\n 27 28  1  0     0  0\nM  END',
        melting_point: null,
        boiling_point: null,
        sum_formular: 'C21H22F3N3O',
        names: [],
        iupac_name:
          'N-[1-pentyl-7-(trifluoromethyl)indazol-3-yl]-2-phenylacetamide',
        molecule_svg_file:
          'e8dba3681d3a3bb8afa398daa2ab5a8d2d27927e264084d3209bcb6817f31485f6e21951bd69c60e8553667fdbcc3d8686bd2e761890a8449533276266372566.svg',
        created_at: '2017-02-13T08:13:10.326Z',
        updated_at: '2017-03-28T11:15:31.446Z',
        deleted_at: null,
        is_partial: false,
        exact_molecular_weight: 389.17149699900017,
        cano_smiles: 'CCCCCn1nc(c2c1c(ccc2)C(F)(F)F)NC(=O)Cc1ccccc1',
        cas: [],
        molfile_version: 'V2000',
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
          user_id,
          molecule_id: moleculeId,
          // TODO: DUMMY DATA
          molfile:
            '\n  Ketcher 02131709132D 1   1.00000     0.00000     0\n\n 28 30  0     0  0            999 V2000\n    6.6500   -4.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.5160   -4.9750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.5160   -5.9750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.6500   -6.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7840   -5.9750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7840   -4.9750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.4942   -4.7670    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.9942   -5.6331    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    8.3250   -6.3762    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    6.6500   -7.4750    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7840   -7.9750    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    7.5160   -7.9750    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    7.5160   -6.9750    0.0000 F   0  0  0  0  0  0  0  0  0  0  0  0\n    8.5126   -7.3585    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    8.9009   -3.8535    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0\n    9.8955   -3.7489    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.3022   -2.8354    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0\n   10.4832   -4.5580    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.4778   -4.4534    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.9778   -3.5874    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   12.9778   -3.5874    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   13.4778   -4.4534    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   12.9778   -5.3194    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.9778   -5.3194    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.4570   -7.6872    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    9.6445   -8.6695    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.5890   -8.9982    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.7765   -9.9804    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0     0  0\n  2  3  2  0     0  0\n  3  4  1  0     0  0\n  4  5  2  0     0  0\n  5  6  1  0     0  0\n  6  1  2  0     0  0\n  2  7  1  0     0  0\n  7  8  2  0     0  0\n  8  9  1  0     0  0\n  9  3  1  0     0  0\n  4 10  1  0     0  0\n 10 11  1  0     0  0\n 10 12  1  0     0  0\n 10 13  1  0     0  0\n  9 14  1  0     0  0\n  7 15  1  0     0  0\n 15 16  1  0     0  0\n 16 17  2  0     0  0\n 16 18  1  0     0  0\n 18 19  1  0     0  0\n 19 20  1  0     0  0\n 20 21  2  0     0  0\n 21 22  1  0     0  0\n 22 23  2  0     0  0\n 23 24  1  0     0  0\n 24 19  2  0     0  0\n 14 25  1  0     0  0\n 25 26  1  0     0  0\n 26 27  1  0     0  0\n 27 28  1  0     0  0\nM  END\n$$$$\n\n',
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

  const uidToContainer = processedFolders.reduce((acc, folder) => {
    // HINT: Do not create containers for container types that are not allowed
    //        to be in the export.json file
    if (
      folder.metadata?.container_type === 'structure' ||
      folder.metadata?.container_type === 'folder'
    )
      return acc

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
          description: null,
          created_at: currentDate,
          updated_at: currentDate,
          parent_id: uidMap[folder.parentUid] || null,
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
