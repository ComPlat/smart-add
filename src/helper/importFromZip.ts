import { filesDB, Datatype, ReactionSchemeType, Metadata } from '@/database/db'
import JSZip from 'jszip'
import { v4 } from 'uuid'
import {
  sampleTemplate,
  reactionTemplate,
  moleculeTemplate,
  datasetTemplate,
  containerTemplate,
} from '@/app/components/zip-download/templates'

// Types for export data structure
type ExportJson = {
  Collection: Record<string, ExportCollection>
  Sample?: Record<string, ExportSample>
  Reaction?: Record<string, ExportReaction>
  Molecule?: Record<string, ExportMolecule>
  MoleculeName?: Record<string, ExportMoleculeName>
  Container: Record<string, ExportContainer>
  Attachment?: Record<string, ExportAttachment>
  CollectionsSample?: Record<string, ExportLink>
  CollectionsReaction?: Record<string, ExportLink>
  ReactionsStartingMaterialSample?: Record<string, ExportReactionSampleLink>
  ReactionsReactantSample?: Record<string, ExportReactionSampleLink>
  ReactionsProductSample?: Record<string, ExportReactionSampleLink>
  ReactionsSolventSample?: Record<string, ExportReactionSampleLink>
  Fingerprint?: Record<string, ExportFingerprint>
  Dataset?: Record<string, ExportDataset>
  source?: string
}

type ExportDataset = {
  name?: string
  description?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

type ExportCollection = {
  label?: string
  [key: string]: unknown
}

type ExportSample = {
  name?: string
  short_label?: string
  external_label?: string
  molfile?: string
  sample_svg_file?: string
  molecule_id?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

type ExportReaction = {
  name?: string
  short_label?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

type ExportMolecule = {
  molfile?: string
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

type ExportMoleculeName = {
  molecule_id: string
  name: string
  [key: string]: unknown
}

type ExportContainer = {
  name?: string
  parent_id?: string
  containable_id?: string
  containable_type?: string
  container_type?: string
  ancestry?: string
  [key: string]: unknown
}

type ExportAttachment = {
  [key: string]: unknown
}

type ExportLink = {
  [key: string]: unknown
}

type ExportReactionSampleLink = {
  sample_id: string
  reaction_id: string
  [key: string]: unknown
}

type ExportFingerprint = {
  [key: string]: unknown
}

// Constants
const TARGET_TREE_ROOT = 'assignmentTreeRoot'
const DEFAULT_COLLECTION_NAME = 'Imported Collection'
const DEFAULT_FOLDER_NAME = 'Folder'
const DEFAULT_SAMPLE_NAME = 'Sample'
const DEFAULT_REACTION_NAME = 'Reaction'
const DEFAULT_MOLECULE_NAME = 'molecule'
const DEFAULT_ANALYSIS_NAME = 'analysis'
const DEFAULT_DATASET_NAME = 'dataset'
const ANALYSES_FOLDER_NAME = 'analyses'
const EXPORT_JSON_FILENAME = 'export.json'
const ID_SUFFIX_LENGTH = 8

// Container types
const CONTAINER_TYPE_ROOT = 'root'
const CONTAINER_TYPE_ANALYSES = 'analyses'
const CONTAINER_TYPE_ANALYSIS = 'analysis'
const CONTAINER_TYPE_DATASET = 'dataset'

// Containable types
const CONTAINABLE_TYPE_REACTION = 'Reaction'
const CONTAINABLE_TYPE_SAMPLE = 'Sample'
const CONTAINABLE_TYPE_MOLECULE = 'Molecule'

// Helper functions

/**
 * Removes structural fields from container data, keeping only metadata fields
 */
const extractMetadataFromContainer = (
  container: ExportContainer,
): Record<string, unknown> => {
  // Destructure to exclude structural fields from metadata
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { parent_id, ancestry, containable_id, containable_type, ...metadata } =
    container
  return metadata
}

/**
 * Extracts export data from a JSON or ZIP file
 */
const getExportData = async (file: File): Promise<ExportJson> => {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.json')) {
    const text = await file.text()
    return JSON.parse(text) as ExportJson
  }

  if (fileName.endsWith('.zip')) {
    const zip = new JSZip()
    const zipData = await zip.loadAsync(file)

    const exportJsonFile = zipData.file(EXPORT_JSON_FILENAME)
    if (!exportJsonFile) {
      throw new Error(`No ${EXPORT_JSON_FILENAME} found in ZIP file`)
    }

    const exportJsonContent = await exportJsonFile.async('string')
    return JSON.parse(exportJsonContent) as ExportJson
  }

  throw new Error('Unsupported file type. Please upload a JSON or ZIP file.')
}

/**
 * Determines the reaction scheme type for a sample based on its relationships
 */
const determineReactionSchemeType = (
  sampleId: string,
  exportData: ExportJson,
): ReactionSchemeType => {
  if (exportData.ReactionsStartingMaterialSample) {
    const isStartingMaterial = Object.values(
      exportData.ReactionsStartingMaterialSample,
    ).some((link) => link.sample_id === sampleId)
    if (isStartingMaterial) return 'startingMaterial'
  }

  if (exportData.ReactionsReactantSample) {
    const isReactant = Object.values(exportData.ReactionsReactantSample).some(
      (link) => link.sample_id === sampleId,
    )
    if (isReactant) return 'reactant'
  }

  if (exportData.ReactionsProductSample) {
    const isProduct = Object.values(exportData.ReactionsProductSample).some(
      (link) => link.sample_id === sampleId,
    )
    if (isProduct) return 'product'
  }

  if (exportData.ReactionsSolventSample) {
    const isSolvent = Object.values(exportData.ReactionsSolventSample).some(
      (link) => link.sample_id === sampleId,
    )
    if (isSolvent) return 'solvent'
  }

  return 'none'
}

/**
 * Generates a unique folder name with ID suffix if needed
 */
const generateUniqueName = (
  baseName: string,
  defaultName: string,
  id: string,
): string => {
  return baseName === defaultName
    ? `${baseName}-${id.slice(0, ID_SUFFIX_LENGTH)}`
    : baseName
}

/**
 * Merges sample data with template
 */
const processSampleMetadata = (
  sample: ExportSample,
  folderName: string,
): Record<string, unknown> => {
  return {
    ...sampleTemplate,
    ...sample,
    name: sample.name || folderName, // Use folder name if sample.name is null
    created_at: sample.created_at || new Date().toISOString(),
    updated_at: sample.updated_at || new Date().toISOString(),
  }
}

/**
 * Merges reaction data with template
 */
const processReactionMetadata = (
  reaction: ExportReaction,
  folderName: string,
): Record<string, unknown> => {
  // Convert description from Delta format to plain text if needed
  let description = reaction.description
  if (description && typeof description === 'object' && 'ops' in description) {
    // Delta/Quill format - extract plain text
    description = (description as any).ops
      .map((op: any) => op.insert || '')
      .join('')
  }

  return {
    ...reactionTemplate,
    ...reaction,
    name: reaction.name || folderName, // Use folder name if reaction.name is null
    description,
    created_at: reaction.created_at || new Date().toISOString(),
    updated_at: reaction.updated_at || new Date().toISOString(),
  }
}

/**
 * Generates folder name for a sample
 */
const getSampleFolderName = (sample: ExportSample, id: string): string => {
  const baseName =
    sample.name ||
    sample.short_label ||
    sample.external_label ||
    DEFAULT_SAMPLE_NAME
  return generateUniqueName(baseName, DEFAULT_SAMPLE_NAME, id)
}

/**
 * Generates folder name for a reaction
 */
const getReactionFolderName = (
  reaction: ExportReaction,
  id: string,
): string => {
  const baseName =
    reaction.name || reaction.short_label || DEFAULT_REACTION_NAME
  return generateUniqueName(baseName, DEFAULT_REACTION_NAME, id)
}

export const importFromJsonOrZip = async (file: File) => {
  const exportData = await getExportData(file)

  // Validate basic structure
  if (!exportData.Collection || !exportData.Container) {
    throw new Error(
      'Invalid export format: Missing required Collection or Container data',
    )
  }

  const collectionId = Object.keys(exportData.Collection)[0]
  if (!collectionId) {
    throw new Error('Invalid export format: No collection found')
  }

  // Get collection info
  const collection = exportData.Collection[collectionId]
  const collectionName = collection?.label || DEFAULT_COLLECTION_NAME

  // Create collection folder
  const collectionUid = v4()
  await filesDB.folders.add({
    dtype: 'folder',
    fullPath: collectionName,
    isFolder: true,
    metadata: { container_type: 'folder', ...collection },
    name: collectionName,
    parentUid: '',
    reactionSchemeType: 'none',
    treeId: TARGET_TREE_ROOT,
    uid: collectionUid,
  })

  // Map old container IDs to new UIDs
  const containerIdToUidMap: Record<string, string> = {}
  Object.keys(exportData.Container).forEach((containerId) => {
    containerIdToUidMap[containerId] = v4()
  })

  // Build a map to track which containers we've created
  const createdContainers = new Set<string>()

  /**
   * Determines the parent UID for a container
   */
  const getParentUid = (container: ExportContainer): string => {
    if (!container.parent_id) {
      // Top-level container - check if it's linked to sample/reaction
      const containableId = container.containable_id
      const containableType = container.containable_type

      if (containableType === CONTAINABLE_TYPE_SAMPLE && containableId) {
        // Check if sample is part of a reaction
        const reactionLink = [
          exportData.ReactionsStartingMaterialSample,
          exportData.ReactionsReactantSample,
          exportData.ReactionsProductSample,
          exportData.ReactionsSolventSample,
        ]
          .filter(Boolean)
          .flatMap((obj) => Object.values(obj!))
          .find((link) => link.sample_id === containableId)

        if (reactionLink) {
          // Sample is part of a reaction - find the reaction container
          const reactionId = reactionLink.reaction_id
          const reactionContainer = Object.entries(exportData.Container).find(
            ([, c]) =>
              c.containable_type === CONTAINABLE_TYPE_REACTION &&
              c.containable_id === reactionId,
          )
          if (reactionContainer) {
            return containerIdToUidMap[reactionContainer[0]]
          }
        }
      }

      // Default to collection
      return collectionUid
    }

    // Has parent_id - check if parent is a root container
    const parentContainer = exportData.Container[container.parent_id]
    if (parentContainer?.container_type === CONTAINER_TYPE_ROOT) {
      // Parent is root - the sample/reaction folder should have been created with this UID
      return containerIdToUidMap[container.parent_id]
    }

    // Has parent_id - use mapped UID
    return containerIdToUidMap[container.parent_id] || collectionUid
  }

  /**
   * Sorts containers: reactions first, then by ancestry depth
   */
  const sortedContainers = Object.entries(exportData.Container).sort(
    ([, a], [, b]) => {
      // Prioritize reactions over samples at the same depth
      const isReactionA =
        a.container_type === CONTAINER_TYPE_ROOT &&
        a.containable_type === CONTAINABLE_TYPE_REACTION
      const isReactionB =
        b.container_type === CONTAINER_TYPE_ROOT &&
        b.containable_type === CONTAINABLE_TYPE_REACTION

      if (isReactionA && !isReactionB) return -1
      if (!isReactionA && isReactionB) return 1

      // Then sort by ancestry depth
      const depthA = (a.ancestry || '').split('/').filter(Boolean).length
      const depthB = (b.ancestry || '').split('/').filter(Boolean).length
      return depthA - depthB
    },
  )

  // Track sample UIDs to molecule UIDs for creating molecule folders
  const sampleUidToMoleculeUid: Record<string, string> = {}

  // Cache for parent folder paths to avoid repeated database queries
  const parentPathCache: Map<string, string> = new Map()
  parentPathCache.set(collectionUid, collectionName)

  /**
   * Processes a sample container and returns folder details
   */
  const processSampleContainer = (
    containableId: string,
  ): {
    dtype: Datatype
    folderName: string
    metadata: Record<string, unknown>
    reactionSchemeType: ReactionSchemeType
  } | null => {
    if (!exportData.Sample) return null

    const sample = exportData.Sample[containableId]
    if (!sample) return null

    const folderName = getSampleFolderName(sample, containableId)

    return {
      dtype: 'sample',
      folderName,
      metadata: processSampleMetadata(sample, folderName),
      reactionSchemeType: determineReactionSchemeType(
        containableId,
        exportData,
      ),
    }
  }

  /**
   * Processes a reaction container and returns folder details
   */
  const processReactionContainer = (
    containableId: string,
  ): {
    dtype: Datatype
    folderName: string
    metadata: Record<string, unknown>
  } | null => {
    if (!exportData.Reaction) return null

    const reaction = exportData.Reaction[containableId]
    if (!reaction) return null

    const folderName = getReactionFolderName(reaction, containableId)

    return {
      dtype: 'reaction',
      folderName,
      metadata: processReactionMetadata(reaction, folderName),
    }
  }

  /**
   * Processes a molecule container and returns folder details
   */
  const processMoleculeContainer = (
    containableId: string,
  ): {
    dtype: Datatype
    folderName: string
    metadata: Record<string, unknown>
  } | null => {
    if (!exportData.Molecule) return null

    const molecule = exportData.Molecule[containableId]
    if (!molecule) return null

    let folderName = DEFAULT_MOLECULE_NAME

    // Try to get name from MoleculeName
    if (exportData.MoleculeName) {
      const moleculeNameEntry = Object.values(exportData.MoleculeName).find(
        (mn) => mn.molecule_id === containableId,
      )
      if (moleculeNameEntry) {
        folderName = moleculeNameEntry.name || DEFAULT_MOLECULE_NAME
      }
    }

    return {
      dtype: 'molecule',
      folderName,
      metadata: {
        ...moleculeTemplate,
        ...molecule,
        created_at: molecule.created_at || new Date().toISOString(),
        updated_at: molecule.updated_at || new Date().toISOString(),
      },
    }
  }

  // Process containers
  for (const [containerId, container] of sortedContainers) {
    const containerUid = containerIdToUidMap[containerId]
    const containableId = container.containable_id
    const containableType = container.containable_type

    // Determine parent
    const parentUid = getParentUid(container)

    // Get parent folder path from cache or database
    let parentPath = parentPathCache.get(parentUid)
    if (!parentPath) {
      const parentFolder = await filesDB.folders
        .where('uid')
        .equals(parentUid)
        .first()
      parentPath = parentFolder?.fullPath || collectionName
      if (parentFolder) {
        parentPathCache.set(parentUid, parentPath)
      }
    }

    // Determine dtype, name, and metadata
    let dtype: Datatype = 'folder'
    let folderName = container.name || DEFAULT_FOLDER_NAME
    let metadata: Record<string, unknown> = { ...container }
    let reactionSchemeType: ReactionSchemeType = 'none'

    // Handle different container types
    if (containableType === CONTAINABLE_TYPE_REACTION && containableId) {
      const result = processReactionContainer(containableId)
      if (result) {
        dtype = result.dtype
        folderName = result.folderName
        metadata = result.metadata
      }
    } else if (containableType === CONTAINABLE_TYPE_SAMPLE && containableId) {
      const result = processSampleContainer(containableId)
      if (result) {
        dtype = result.dtype
        folderName = result.folderName
        metadata = result.metadata
        reactionSchemeType = result.reactionSchemeType
      }
    } else if (containableType === CONTAINABLE_TYPE_MOLECULE && containableId) {
      const result = processMoleculeContainer(containableId)
      if (result) {
        dtype = result.dtype
        folderName = result.folderName
        metadata = result.metadata
      }
    } else if (container.container_type === CONTAINER_TYPE_ANALYSES) {
      dtype = 'analyses'
      folderName = ANALYSES_FOLDER_NAME
      // Use template for field definitions, then merge container metadata
      metadata = {
        ...containerTemplate,
        ...extractMetadataFromContainer(container),
        name: container.name || ANALYSES_FOLDER_NAME,
        container_type: 'analyses',
        extended_metadata: container.extended_metadata || {},
      }
    } else if (container.container_type === CONTAINER_TYPE_ANALYSIS) {
      dtype = 'analysis'
      folderName = container.name || DEFAULT_ANALYSIS_NAME
      // Use template for field definitions, then merge container metadata
      metadata = {
        ...containerTemplate,
        ...extractMetadataFromContainer(container),
        name: container.name || DEFAULT_ANALYSIS_NAME,
        container_type: 'analysis',
        extended_metadata: {
          status: null,
          kind: null,
          ...(container.extended_metadata || {}),
        },
      }
    } else if (container.container_type === CONTAINER_TYPE_DATASET) {
      dtype = 'dataset'
      folderName = container.name || DEFAULT_DATASET_NAME
      // Check if there's dataset data in the Dataset table
      if (containableId && exportData.Dataset) {
        const dataset = exportData.Dataset[containableId]
        if (dataset) {
          // Use datasetTemplate for field definitions, then merge dataset and container metadata
          metadata = {
            ...datasetTemplate,
            ...extractMetadataFromContainer(container),
            ...dataset,
            name: dataset.name || container.name || DEFAULT_DATASET_NAME,
          }
          folderName = dataset.name || container.name || DEFAULT_DATASET_NAME
        } else {
          // No dataset data, use template with container metadata
          metadata = {
            ...datasetTemplate,
            ...extractMetadataFromContainer(container),
            name: container.name || DEFAULT_DATASET_NAME,
          }
        }
      } else {
        // No dataset table or containable_id, use template with container metadata
        metadata = {
          ...datasetTemplate,
          ...extractMetadataFromContainer(container),
          name: container.name || DEFAULT_DATASET_NAME,
        }
      }
    }

    const folderPath = `${parentPath}/${folderName}`

    // Create the folder
    await filesDB.folders.add({
      dtype,
      fullPath: folderPath,
      isFolder: true,
      metadata: metadata as Metadata,
      name: folderName,
      parentUid,
      reactionSchemeType,
      treeId: TARGET_TREE_ROOT,
      uid: containerUid,
    })

    // Cache the path for this folder to avoid future lookups
    parentPathCache.set(containerUid, folderPath)
    createdContainers.add(containerId)

    // After creating a Sample container, check if it needs a molecule folder
    if (dtype === 'sample' && containableId && exportData.Sample) {
      const sample = exportData.Sample[containableId]

      if (sample?.molfile) {
        // Create molecule folder
        const moleculeUid = v4()
        const moleculeFolderPath = `${folderPath}/${DEFAULT_MOLECULE_NAME}`

        // Start with template to ensure all fields exist
        let moleculeMetadata: Record<string, unknown> = {
          ...moleculeTemplate,
          molfile: sample.molfile,
          molecule_svg_file: sample.sample_svg_file,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Check if there's a Molecule entry with more complete data
        if (exportData.Molecule && sample.molecule_id) {
          const moleculeData = exportData.Molecule[sample.molecule_id]
          if (moleculeData) {
            moleculeMetadata = {
              ...moleculeTemplate,
              ...moleculeData,
              molfile: moleculeData.molfile || sample.molfile,
              created_at: moleculeData.created_at || new Date().toISOString(),
              updated_at: moleculeData.updated_at || new Date().toISOString(),
            }
          }
        }

        await filesDB.folders.add({
          dtype: 'molecule',
          fullPath: moleculeFolderPath,
          isFolder: true,
          metadata: moleculeMetadata as Metadata,
          name: DEFAULT_MOLECULE_NAME,
          parentUid: containerUid,
          reactionSchemeType: 'none',
          treeId: TARGET_TREE_ROOT,
          uid: moleculeUid,
        })

        sampleUidToMoleculeUid[containerUid] = moleculeUid
      }
    }
  }

  return {
    message: `Successfully imported ${collectionName}`,
    collectionName,
  }
}

// Backward compatibility - alias for the old function name
export const importFromZip = importFromJsonOrZip
