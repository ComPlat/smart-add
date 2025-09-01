import { ExtendedFolder } from '@/database/db'

import { Ancestry } from './Ancestry'
import { containerTemplate } from './templates'
import { Container as ContainerSchemaType, containerSchema } from './zodSchemes'

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
        extended_metadata: folder.metadata?.extended_metadata || {},
        name: folder.name,
        parent_id: uidMap[folder.parentUid] || null,
        updated_at: currentDate,
        user_id,
      }),
    },
  }
}

interface ContainerParams {
  assignedFolders: ExtendedFolder[]
  currentDate: string
  processedFolders: ExtendedFolder[]
  sampleReactionUidMap: Record<string, string>
  uidMap: Record<string, string>
  user_id: null | string
}

export const Container = ({
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

    const container = {
      ...previousContainer,
      ...subContainer,
    }

    return container
  }, {} as ContainerSchemaType)
}
