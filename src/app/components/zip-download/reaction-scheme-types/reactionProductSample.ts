import { ReactionSchemeProps } from '@/types/ReactionSchemeProps'
import { v4 } from 'uuid'

import { reactionSchemeTemplate } from '../templates'
import {
  ReactionScheme as ReactionSchemeType,
  reactionSchemeSchema,
} from '../zodSchemes'

export const ReactionsProductSample = ({
  assignedFolders,
  sampleReactionUidMap,
}: ReactionSchemeProps) => {
  const allowedFolders = assignedFolders.filter(
    (folder) => folder.parentUid && folder.reactionSchemeType === 'reactant',
  )

  return allowedFolders.reduce((acc, folder, index) => {
    const product = {
      [v4()]: reactionSchemeSchema.parse({
        ...reactionSchemeTemplate,
        position: index,
        reaction_id: sampleReactionUidMap[folder.parentUid] || null,
        sample_id: sampleReactionUidMap[folder.uid] || null,
      }),
    }

    return { ...acc, ...product }
  }, {} as ReactionSchemeType)
}
