import { ExtendedFolder } from '@/database/db'
import { ReactionSchemeProps } from '@/types/ReactionSchemeProps'
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

// export const ReactionsSolventSample = ({
//   processedFolders,
//   sampleReactionUidMap,
// }: ReactionsSolventSampleParams): Record<string, ReactionSchemeType> => {
//   return processedFolders.reduce(
//     (uidToReactionsSolventSample, folder) => {
//       if (folder.dtype !== 'reaction') return uidToReactionsSolventSample

//       const reactionId = sampleReactionUidMap[folder.uid]
//       const childSamples = processedFolders.filter(
//         (sampleFolder) =>
//           sampleFolder.fullPath.startsWith(folder.fullPath + '/') &&
//           sampleFolder.dtype === 'sample',
//       )

//       return childSamples.reduce(
//         (innerUidToReactionsSolventSample, sampleFolder) => {
//           const reactionsSolventSampleId = v4()
//           const newReactionSolventSample = {
//             ...reactionSchemeSchema.parse({
//               ...reactionSchemeTemplate,
//               reaction_id: reactionId,
//               sample_id: sampleReactionUidMap[sampleFolder.uid],
//             }),
//           }
//           innerUidToReactionsSolventSample[reactionsSolventSampleId] =
//             newReactionSolventSample
//           return innerUidToReactionsSolventSample
//         },
//         uidToReactionsSolventSample,
//       )
//     },
//     {} as Record<string, ReactionSchemeType>,
//   )
// }

export const ReactionsSolventSample = ({
  assignedFolders,
  sampleReactionUidMap,
}: ReactionSchemeProps) => {
  const allowedFolders = assignedFolders.filter(
    (folder) => folder.parentUid && folder.reactionSchemeType === 'solvent',
  )

  return allowedFolders.reduce((acc, folder, index) => {
    const solvent = {
      [v4()]: reactionSchemeSchema.parse({
        ...reactionSchemeTemplate,
        position: index,
        reaction_id: sampleReactionUidMap[folder.parentUid] || null,
        sample_id: sampleReactionUidMap[folder.uid] || null,
      }),
    }

    return { ...acc, ...solvent }
  }, {} as ReactionSchemeType)
}
