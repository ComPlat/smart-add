import { filesDB, Datatype, ReactionSchemeType } from '@/database/db'
import JSZip from 'jszip'
import { v4 } from 'uuid'
import {
  sampleTemplate,
  reactionTemplate,
  moleculeTemplate,
} from '@/app/components/zip-download/templates'

type ExportJson = {
  Collection: Record<string, any>
  Sample?: Record<string, any>
  Reaction?: Record<string, any>
  Molecule?: Record<string, any>
  MoleculeName?: Record<string, any>
  Container: Record<string, any>
  Attachment?: Record<string, any>
  CollectionsSample?: Record<string, any>
  CollectionsReaction?: Record<string, any>
  ReactionsStartingMaterialSample?: Record<string, any>
  ReactionsReactantSample?: Record<string, any>
  ReactionsProductSample?: Record<string, any>
  ReactionsSolventSample?: Record<string, any>
  Fingerprint?: Record<string, any>
  source?: string
}

const TARGET_TREE_ROOT = 'assignmentTreeRoot'

// Helper function to get export data from file
const getExportData = async (file: File): Promise<ExportJson> => {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.json')) {
    // Direct JSON file
    const text = await file.text()
    return JSON.parse(text)
  } else if (fileName.endsWith('.zip')) {
    // ZIP file containing export.json
    const zip = new JSZip()
    const zipData = await zip.loadAsync(file)

    const exportJsonFile = zipData.file('export.json')
    if (!exportJsonFile) {
      throw new Error('No export.json found in ZIP file')
    }

    const exportJsonContent = await exportJsonFile.async('string')
    return JSON.parse(exportJsonContent)
  } else {
    throw new Error('Unsupported file type. Please upload a JSON or ZIP file.')
  }
}

export const importFromJsonOrZip = async (file: File) => {
  const exportData = await getExportData(file)

  // Validate basic structure
  if (!exportData.Collection || !exportData.Container) {
    throw new Error('Invalid export format: Missing required data')
  }

  // Get collection info
  const collectionId = Object.keys(exportData.Collection)[0]
  const collection = exportData.Collection[collectionId]
  const collectionName = collection.label || 'Imported Collection'

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

  // Helper function to get parent UID for a container
  const getParentUid = (container: any): string => {
    if (!container.parent_id) {
      // Top-level container - check if it's linked to sample/reaction
      const containableId = container.containable_id
      const containableType = container.containable_type

      if (containableType === 'Sample' && containableId) {
        // Check if sample is part of a reaction
        const reactionLink = [
          exportData.ReactionsStartingMaterialSample,
          exportData.ReactionsReactantSample,
          exportData.ReactionsProductSample,
          exportData.ReactionsSolventSample,
        ]
          .filter(Boolean)
          .flatMap((obj) => Object.values(obj!))
          .find((link: any) => link.sample_id === containableId)

        if (reactionLink) {
          // Sample is part of a reaction - find the reaction container
          const reactionId = (reactionLink as any).reaction_id
          const reactionContainer = Object.entries(exportData.Container).find(
            ([, c]: [string, any]) =>
              c.containable_type === 'Reaction' &&
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
    if (parentContainer && parentContainer.container_type === 'root') {
      // Parent is root - the sample/reaction folder should have been created with this UID
      // We map root containers to their samples/reactions by using the root container's UID mapping
      return containerIdToUidMap[container.parent_id]
    }

    // Has parent_id - use mapped UID
    return containerIdToUidMap[container.parent_id] || collectionUid
  }

  // Sort containers: reactions first, then by ancestry depth
  const sortedContainers = Object.entries(exportData.Container).sort(
    ([, a], [, b]) => {
      // Prioritize reactions over samples at the same depth
      const isReactionA =
        a.container_type === 'root' && a.containable_type === 'Reaction'
      const isReactionB =
        b.container_type === 'root' && b.containable_type === 'Reaction'

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

  // Process containers
  for (const [containerId, container] of sortedContainers) {
    const containerUid = containerIdToUidMap[containerId]
    const containableId = container.containable_id
    const containableType = container.containable_type

    // Determine parent
    const parentUid = getParentUid(container)

    // Get parent folder path
    const parentFolder = await filesDB.folders
      .where('uid')
      .equals(parentUid)
      .first()
    const parentPath = parentFolder?.fullPath || collectionName

    // Determine dtype, name, and metadata
    let dtype: Datatype = 'folder'
    let folderName = container.name || 'Folder'
    let metadata: any = { ...container }
    let reactionSchemeType: ReactionSchemeType = 'none'

    // Handle different container types
    if (container.container_type === 'root') {
      // Root container - create the sample/reaction folder
      if (
        containableType === 'Reaction' &&
        containableId &&
        exportData.Reaction
      ) {
        dtype = 'reaction'
        const reaction = exportData.Reaction[containableId]
        if (reaction) {
          // Merge with template to ensure all required fields exist
          metadata = {
            ...metadata,
            ...reactionTemplate,
            ...reaction,
            created_at: reaction.created_at || new Date().toISOString(),
            updated_at: reaction.updated_at || new Date().toISOString(),
          }
          const baseName = reaction.name || reaction.short_label || 'Reaction'
          // Add ID suffix to ensure uniqueness if base name is generic
          folderName =
            baseName === 'Reaction'
              ? `${baseName}-${containableId.slice(0, 8)}`
              : baseName
        }
      } else if (
        containableType === 'Sample' &&
        containableId &&
        exportData.Sample
      ) {
        dtype = 'sample'
        const sample = exportData.Sample[containableId]
        if (sample) {
          // Merge with template to ensure all required fields exist
          metadata = {
            ...container,
            ...sampleTemplate,
            ...sample,
            created_at: sample.created_at || new Date().toISOString(),
            updated_at: sample.updated_at || new Date().toISOString(),
          }
          const baseName =
            sample.name ||
            sample.short_label ||
            sample.external_label ||
            'Sample'
          // Add ID suffix to ensure uniqueness if base name is generic
          folderName =
            baseName === 'Sample'
              ? `${baseName}-${containableId.slice(0, 8)}`
              : baseName

          // Determine reaction scheme type
          if (exportData.ReactionsStartingMaterialSample) {
            const isStartingMaterial = Object.values(
              exportData.ReactionsStartingMaterialSample,
            ).some((link: any) => link.sample_id === containableId)
            if (isStartingMaterial) reactionSchemeType = 'startingMaterial'
          }
          if (exportData.ReactionsReactantSample) {
            const isReactant = Object.values(
              exportData.ReactionsReactantSample,
            ).some((link: any) => link.sample_id === containableId)
            if (isReactant) reactionSchemeType = 'reactant'
          }
          if (exportData.ReactionsProductSample) {
            const isProduct = Object.values(
              exportData.ReactionsProductSample,
            ).some((link: any) => link.sample_id === containableId)
            if (isProduct) reactionSchemeType = 'product'
          }
          if (exportData.ReactionsSolventSample) {
            const isSolvent = Object.values(
              exportData.ReactionsSolventSample,
            ).some((link: any) => link.sample_id === containableId)
            if (isSolvent) reactionSchemeType = 'solvent'
          }
        }
      }
    } else if (
      containableType === 'Reaction' &&
      containableId &&
      exportData.Reaction
    ) {
      dtype = 'reaction'
      const reaction = exportData.Reaction[containableId]
      if (reaction) {
        // Merge with template to ensure all required fields exist
        metadata = {
          ...metadata,
          ...reactionTemplate,
          ...reaction,
          created_at: reaction.created_at || new Date().toISOString(),
          updated_at: reaction.updated_at || new Date().toISOString(),
        }
        const baseName = reaction.name || reaction.short_label || 'Reaction'
        // Add ID suffix to ensure uniqueness if base name is generic
        folderName =
          baseName === 'Reaction'
            ? `${baseName}-${containableId.slice(0, 8)}`
            : baseName
      }
    } else if (
      containableType === 'Sample' &&
      containableId &&
      exportData.Sample
    ) {
      dtype = 'sample'
      const sample = exportData.Sample[containableId]
      if (sample) {
        // Merge with template to ensure all required fields exist
        metadata = {
          ...metadata,
          ...sampleTemplate,
          ...sample,
          created_at: sample.created_at || new Date().toISOString(),
          updated_at: sample.updated_at || new Date().toISOString(),
        }
        const baseName =
          sample.name || sample.short_label || sample.external_label || 'Sample'
        // Add ID suffix to ensure uniqueness if base name is generic
        folderName =
          baseName === 'Sample'
            ? `${baseName}-${containableId.slice(0, 8)}`
            : baseName

        // Determine reaction scheme type
        if (exportData.ReactionsStartingMaterialSample) {
          const isStartingMaterial = Object.values(
            exportData.ReactionsStartingMaterialSample,
          ).some((link: any) => link.sample_id === containableId)
          if (isStartingMaterial) reactionSchemeType = 'startingMaterial'
        }
        if (exportData.ReactionsReactantSample) {
          const isReactant = Object.values(
            exportData.ReactionsReactantSample,
          ).some((link: any) => link.sample_id === containableId)
          if (isReactant) reactionSchemeType = 'reactant'
        }
        if (exportData.ReactionsProductSample) {
          const isProduct = Object.values(
            exportData.ReactionsProductSample,
          ).some((link: any) => link.sample_id === containableId)
          if (isProduct) reactionSchemeType = 'product'
        }
        if (exportData.ReactionsSolventSample) {
          const isSolvent = Object.values(
            exportData.ReactionsSolventSample,
          ).some((link: any) => link.sample_id === containableId)
          if (isSolvent) reactionSchemeType = 'solvent'
        }
      }
    } else if (
      containableType === 'Molecule' &&
      containableId &&
      exportData.Molecule
    ) {
      dtype = 'molecule'
      const molecule = exportData.Molecule[containableId]
      if (molecule) {
        metadata = { ...metadata, ...molecule }
        folderName = 'molecule'

        // Try to get name from MoleculeName
        if (exportData.MoleculeName) {
          const moleculeNameEntry = Object.values(exportData.MoleculeName).find(
            (mn: any) => mn.molecule_id === containableId,
          )
          if (moleculeNameEntry) {
            folderName = (moleculeNameEntry as any).name || 'molecule'
          }
        }
      }
    } else if (container.container_type === 'analyses') {
      dtype = 'analyses'
      folderName = 'analyses'
    } else if (container.container_type === 'analysis') {
      dtype = 'analysis'
      folderName = container.name || 'analysis'
    } else if (container.container_type === 'dataset') {
      dtype = 'dataset'
      folderName = container.name || 'dataset'
    }

    const folderPath = `${parentPath}/${folderName}`

    // Create the folder
    await filesDB.folders.add({
      dtype,
      fullPath: folderPath,
      isFolder: true,
      metadata,
      name: folderName,
      parentUid,
      reactionSchemeType,
      treeId: TARGET_TREE_ROOT,
      uid: containerUid,
    })

    createdContainers.add(containerId)

    // After creating a Sample container, check if it needs a molecule folder
    if (dtype === 'sample' && containableId && exportData.Sample) {
      const sample = exportData.Sample[containableId]

      if (sample && sample.molfile) {
        // Create molecule folder
        const moleculeUid = v4()
        const moleculeFolderPath = `${folderPath}/molecule`

        // Start with template to ensure all fields exist
        let moleculeMetadata: any = {
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
              molfile: moleculeData.molfile || sample.molfile, // Prefer Molecule molfile, fallback to Sample
              created_at: moleculeData.created_at || new Date().toISOString(),
              updated_at: moleculeData.updated_at || new Date().toISOString(),
            }
          }
        }

        await filesDB.folders.add({
          dtype: 'molecule',
          fullPath: moleculeFolderPath,
          isFolder: true,
          metadata: moleculeMetadata,
          name: 'molecule',
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
