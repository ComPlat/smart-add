import { assignmentsDB } from '@/database/db'
import { FileNode } from '@/helper/types'
import { v4 } from 'uuid'

const generateUniqueFolderName = (
  baseFolderName: string,
  tree: Record<string, FileNode>,
  counter = 0,
): string => {
  const folderName =
    counter === 0 ? baseFolderName : `${baseFolderName}_${counter}`

  return tree[folderName]
    ? generateUniqueFolderName(baseFolderName, tree, counter + 1)
    : folderName
}

const createSample = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
) => {
  const uniqueFolderName = generateUniqueFolderName(baseFolderName, tree)

  const sample = {
    fullPath: uniqueFolderName,
    isFolder: true,
    name: uniqueFolderName,
    parentUid: v4(),
    uid: v4(),
  }
  const structure = {
    fullPath: `${uniqueFolderName}/structure`,
    isFolder: true,
    name: 'structure',
    parentUid: v4(),
    uid: v4(),
  }
  const analyses = {
    fullPath: `${uniqueFolderName}/analyses`,
    isFolder: true,
    name: 'analyses',
    parentUid: v4(),
    uid: v4(),
  }

  await assignmentsDB.assignedFolders.add(sample)
  await assignmentsDB.assignedFolders.add(structure)
  await assignmentsDB.assignedFolders.add(analyses)
}

const createReaction = async (
  baseFolderName: string,
  tree: Record<string, FileNode>,
  sampleName: string,
) => {
  const uniqueFolderName = generateUniqueFolderName(baseFolderName, tree)

  const reaction = {
    fullPath: uniqueFolderName,
    isFolder: true,
    name: uniqueFolderName,
    parentUid: v4(),
    uid: v4(),
  }
  const sample = {
    fullPath: `${uniqueFolderName}/${sampleName}`,
    isFolder: true,
    name: sampleName,
    parentUid: v4(),
    uid: v4(),
  }
  const structure = {
    fullPath: `${uniqueFolderName}/${sampleName}/structure`,
    isFolder: true,
    name: 'structure',
    parentUid: v4(),
    uid: v4(),
  }
  const analyses = {
    fullPath: `${uniqueFolderName}/${sampleName}/analyses`,
    isFolder: true,
    name: 'analyses',
    parentUid: v4(),
    uid: v4(),
  }

  await assignmentsDB.assignedFolders.add(reaction)
  await assignmentsDB.assignedFolders.add(sample)
  await assignmentsDB.assignedFolders.add(structure)
  await assignmentsDB.assignedFolders.add(analyses)
}

export { createReaction, createSample }
