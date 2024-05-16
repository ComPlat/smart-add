import { ReactionSchemeProps } from '@/types/ReactionSchemeProps'
import { v4 } from 'uuid'

import { reactionSchemeTemplate } from '../templates'
import {
  ReactionScheme as ReactionSchemeType,
  reactionSchemeSchema,
} from '../zodSchemes'

export const ReactionsStartingMaterialSample = ({
  assignedFolders,
  sampleReactionUidMap,
}: ReactionSchemeProps) => {
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
        reaction_id: sampleReactionUidMap[folder.parentUid] || null,
        reference: index === 0 ? true : false,
        sample_id: sampleReactionUidMap[folder.uid] || null,
      }),
    }

    return { ...acc, ...startingMaterial }
  }, {} as ReactionSchemeType)
}
