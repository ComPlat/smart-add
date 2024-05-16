import { ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import { reactionSchemeTemplate } from '../templates'
import {
  ReactionScheme as ReactionSchemeType,
  reactionSchemeSchema,
} from '../zodSchemes'

interface ReactionsSolventSampleParams {
  processedFolders: ExtendedFolder[]
  sampleReactionUidMap: Record<string, string>
}

export const ReactionsSolventSample = ({
  processedFolders,
  sampleReactionUidMap,
}: ReactionsSolventSampleParams): Record<string, ReactionSchemeType> => {
  return processedFolders.reduce(
    (uidToReactionsSolventSample, folder) => {
      if (folder.dtype !== 'reaction') return uidToReactionsSolventSample

      const reactionId = sampleReactionUidMap[folder.uid]
      const childSamples = processedFolders.filter(
        (sampleFolder) =>
          sampleFolder.fullPath.startsWith(folder.fullPath + '/') &&
          sampleFolder.dtype === 'sample',
      )

      return childSamples.reduce(
        (innerUidToReactionsSolventSample, sampleFolder) => {
          const reactionsSolventSampleId = v4()
          const newReactionSolventSample = {
            ...reactionSchemeSchema.parse({
              ...reactionSchemeTemplate,
              reaction_id: reactionId,
              sample_id: sampleReactionUidMap[sampleFolder.uid],
            }),
          }
          innerUidToReactionsSolventSample[reactionsSolventSampleId] =
            newReactionSolventSample
          return innerUidToReactionsSolventSample
        },
        uidToReactionsSolventSample,
      )
    },
    {} as Record<string, ReactionSchemeType>,
  )
}
