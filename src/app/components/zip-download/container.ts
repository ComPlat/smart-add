import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import { Ancestry } from './Ancestry'
import { containerTemplate, datasetTemplate } from './templates'
import { Container as ContainerSchemaType, containerSchema } from './zodSchemes'

interface DatasetParams {
  assignedFiles: ExtendedFile[]
  assignedFolders: ExtendedFolder[]
  currentDate: string
  folder: ExtendedFolder
  sampleReactionUidMap: Record<string, string>
  uidMap: Record<string, string>
  user_id: null | string
}

const Dataset = ({
  assignedFiles,
  assignedFolders,
  currentDate,
  folder,
  uidMap,
  user_id,
}: DatasetParams) => {
  return assignedFiles
    .filter((file) => file.parentUid === folder.uid)
    .map((file) => {
      const key = v4()

      return {
        [key]: {
          ...containerSchema.parse({
            ...datasetTemplate,
            ...file.metadata,
            ancestry: `${uidMap[file.parentUid]}/${Ancestry(
              folder,
              assignedFolders,
              uidMap,
            )}`,
            created_at: currentDate,
            parent_id: uidMap[file.parentUid],
            updated_at: currentDate,
            user_id,
          }),
        },
      }
    })
}
interface SubContainerParams {
  assignedFolders: ExtendedFolder[]
  currentDate: string
  folder: ExtendedFolder
  sampleReactionUidMap: Record<string, string>
  uidMap: Record<string, string>
  user_id: null | string
}

const SubContainer = ({
  assignedFolders,
  currentDate,
  folder,
  sampleReactionUidMap,
  uidMap,
  user_id,
}: SubContainerParams) => {
  const dtypeMapping = {
    reaction: {
      containable_id: sampleReactionUidMap[folder.uid],
      containable_type: 'Reaction',
    },
    sample: {
      containable_id: sampleReactionUidMap[folder.uid],
      containable_type: 'Sample',
    },
  }

  const { containable_id = null, containable_type = null } =
    dtypeMapping[folder.dtype as keyof typeof dtypeMapping] || {}

  const isAnalysis = folder.metadata?.container_type === 'analysis'

  return {
    [uidMap[folder.uid]]: {
      ...containerSchema.parse({
        ...containerTemplate,
        ...folder.metadata,
        ancestry: Ancestry(folder, assignedFolders, uidMap),
        containable_id,
        containable_type,
        created_at: currentDate,
        description: null,
        extended_metadata: isAnalysis
          ? {
              content: '{"ops":[{"insert":"\\n"}]}',
              index: '0',
              report: 'true',
            }
          : {},
        name: folder.name,
        parent_id: uidMap[folder.parentUid] || null,
        updated_at: currentDate,
        user_id,
      }),
    },
  }
}

interface ContainerParams {
  assignedFiles: ExtendedFile[]
  assignedFolders: ExtendedFolder[]
  currentDate: string
  processedFolders: ExtendedFolder[]
  sampleReactionUidMap: Record<string, string>
  uidMap: Record<string, string>
  user_id: null | string
}

export const Container = ({
  assignedFiles,
  assignedFolders,
  currentDate,
  processedFolders,
  sampleReactionUidMap,
  uidMap,
  user_id,
}: ContainerParams) => {
  const allowedFolders = processedFolders.filter((folder) => {
    return (
      folder.metadata?.container_type !== 'structure' &&
      folder.metadata?.container_type !== 'folder'
    )
  })

  return allowedFolders.reduce((previousContainer, folder) => {
    const subContainer = SubContainer({
      assignedFolders,
      currentDate,
      folder,
      sampleReactionUidMap,
      uidMap,
      user_id,
    })

    const dataset = Dataset({
      assignedFiles,
      assignedFolders,
      currentDate,
      folder,
      sampleReactionUidMap,
      uidMap,
      user_id,
    })

    return { ...previousContainer, ...subContainer, ...dataset }
  }, {} as ContainerSchemaType)
}
