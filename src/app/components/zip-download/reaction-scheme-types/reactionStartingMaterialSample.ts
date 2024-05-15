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
      folder.parentUid && folder.reactionSchemeType === 'startingMaterial',
  )

  return allowedFolders.reduce((acc, folder, index) => {
    const startingMaterial = {
      [v4()]: reactionSchemeSchema.parse({
        ...reactionSchemeTemplate,
        equivalent: index === 0 ? 1 : 0,
        position: index,
        reaction_id: uidMap[folder.parentUid] || null,
        reference: index === 0 ? true : false,
        sample_id: uidMap[folder.uid] || null,
      }),
    }

    return { ...acc, ...startingMaterial }
  }, {} as ReactionSchemeType)
}
