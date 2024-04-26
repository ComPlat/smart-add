import { ExtendedFolder } from '@/database/db'

function findMatchingFolder(
  component: string,
  allFolders: ExtendedFolder[],
  currentFolder: ExtendedFolder,
): ExtendedFolder | undefined {
  return allFolders.find(
    (folder) => folder.name === component && folder !== currentFolder,
  )
}

function updateMatchedUids(
  folder: ExtendedFolder,
  matchedUids: string[],
  uidMap: Record<string, string>,
) {
  const uid = uidMap[folder.uid]
  if (uid && !matchedUids.includes(uid)) {
    matchedUids.push(uid)
  }
}

function getPathComponentsUids(
  pathComponents: string[],
  currentFolder: ExtendedFolder,
  allFolders: ExtendedFolder[],
  uidMap: Record<string, string>,
) {
  return pathComponents.reduce(
    (acc, component) => {
      if (acc.shouldStop) return acc

      const matchingFolder = findMatchingFolder(
        component,
        allFolders,
        currentFolder,
      )

      if (matchingFolder) {
        updateMatchedUids(matchingFolder, acc.matchedUids, uidMap)
        // HINT: Stop at the sample level as ancestry does not contain both reaction and sample
        acc.shouldStop = matchingFolder.dtype === 'sample'
      }

      return acc
    },
    { matchedUids: [] as string[], shouldStop: false },
  )
}

export function Ancestry(
  folder: ExtendedFolder,
  allFolders: ExtendedFolder[],
  uidMap: Record<string, string>,
): string {
  if (folder.dtype === 'sample' || folder.dtype === 'reaction') return ''

  const pathComponents = folder.fullPath.split('/').reverse()
  const { matchedUids } = getPathComponentsUids(
    pathComponents,
    folder,
    allFolders,
    uidMap,
  )

  const currentFolderUid = uidMap[folder.uid]
  const filteredUids = matchedUids.filter((uid) => uid !== currentFolderUid)

  return filteredUids.join('/')
}
