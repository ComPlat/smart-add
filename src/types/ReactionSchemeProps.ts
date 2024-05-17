import { ExtendedFolder } from '@/database/db'

export type ReactionSchemeProps = {
  assignedFolders: ExtendedFolder[]
  sampleReactionUidMap: Record<string, string>
}
