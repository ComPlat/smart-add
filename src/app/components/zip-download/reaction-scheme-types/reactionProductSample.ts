import { ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import { reactionSchemeTemplate } from '../templates'
import {
  ReactionScheme as ReactionSchemeType,
  reactionSchemeSchema,
} from '../zodSchemes'

type ReactionsProductSampleParams = {
  assignedFolders: ExtendedFolder[]
  uidMap: Record<string, string>
}

export const ReactionsProductSample = ({
  assignedFolders,
  uidMap,
}: ReactionsProductSampleParams) => {
  const allowedFolders = assignedFolders.filter(
    (folder) => folder.parentUid && folder.reactionSchemeType === 'reactant',
  )

  return allowedFolders.reduce((acc, folder) => {
    const product = {
      [v4()]: reactionSchemeSchema.parse({
        ...reactionSchemeTemplate,
        reaction_id: uidMap[folder.parentUid] || null,
        sample_id: uidMap[folder.uid] || null,
      }),
    }

    return { ...acc, ...product }
  }, {} as ReactionSchemeType)
}
