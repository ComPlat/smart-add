import { ExtendedFolder } from '@/database/db'
import { v4 } from 'uuid'

import { reactionsSolventSampleTemplate } from './templates'
import {
  ReactionsSolventSample,
  reactionsSolventSampleSchema,
} from './zodSchemes'

interface ReactionsSolventSampleParams {
  currentDate: string
  processedFolders: ExtendedFolder[]
  sampleReactionUidMap: Record<string, string>
}

export const UidToReactionsSolventSample = ({
  currentDate,
  processedFolders,
  sampleReactionUidMap,
}: ReactionsSolventSampleParams): Record<string, ReactionsSolventSample> => {
  return processedFolders.reduce(
    (acc, folder) => {
      if (folder.dtype !== 'reaction') return acc

      const reactionId = sampleReactionUidMap[folder.uid]
      const childSamples = processedFolders.filter(
        (sampleFolder) =>
          sampleFolder.fullPath.startsWith(folder.fullPath + '/') &&
          sampleFolder.dtype === 'sample',
      )

      return childSamples.reduce((innerAcc, sampleFolder) => {
        const reactionsSolventSampleId = v4()
        const newReactionSolventSample = {
          ...reactionsSolventSampleSchema.parse({
            ...reactionsSolventSampleTemplate,
            created_at: currentDate,
            reaction_id: reactionId,
            sample_id: sampleReactionUidMap[sampleFolder.uid],
            updated_at: currentDate,
          }),
        }
        innerAcc[reactionsSolventSampleId] = newReactionSolventSample
        return innerAcc
      }, acc)
    },
    {} as Record<string, ReactionsSolventSample>,
  )
}
