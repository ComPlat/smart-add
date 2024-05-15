import { ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import { reactionSchemeTemplate } from '../templates'
import {
  ReactionScheme as ReactionSchemeType,
  reactionSchemeSchema,
} from '../zodSchemes'

type ReactionsStartingMaterialSampleParams = {
  assignedFolders: ExtendedFolder[]
  uidMap: Record<string, string>
}

export const ReactionsStartingMaterialSample = ({
  assignedFolders,
  uidMap,
}: ReactionsStartingMaterialSampleParams) => {
  const allowedFolders = assignedFolders.filter(
    (folder) =>
      folder.parentUid && folder.reactionSchemeType === 'starting-material',
  )

  return allowedFolders.reduce((acc, folder) => {
    const startingMaterial = {
      [v4()]: reactionSchemeSchema.parse({
        ...reactionSchemeTemplate,
        reaction_id: uidMap[folder.parentUid] || null,
        sample_id: uidMap[folder.uid] || null,
      }),
    }

    return { ...acc, ...startingMaterial }
  }, {} as ReactionSchemeType)
}
