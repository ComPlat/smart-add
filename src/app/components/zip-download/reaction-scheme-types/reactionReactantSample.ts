import { ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import { reactionSchemeTemplate } from '../templates'
import {
  ReactionScheme as ReactionSchemeType,
  reactionSchemeSchema,
} from '../zodSchemes'

type ReactionsReactantSampleParams = {
  assignedFolders: ExtendedFolder[]
  uidMap: Record<string, string>
}

export const ReactionsReactantSample = ({
  assignedFolders,
  uidMap,
}: ReactionsReactantSampleParams) => {
  const allowedFolders = assignedFolders.filter(
    (folder) => folder.parentUid && folder.reactionSchemeType === 'product',
  )

  return allowedFolders.reduce((acc, folder, index) => {
    const reactant = {
      [v4()]: reactionSchemeSchema.parse({
        ...reactionSchemeTemplate,
        position: index,
        reaction_id: uidMap[folder.parentUid] || null,
        sample_id: uidMap[folder.uid] || null,
      }),
    }

    return { ...acc, ...reactant }
  }, {} as ReactionSchemeType)
}
