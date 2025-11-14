import * as XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import {
  sampleTemplate,
  reactionTemplate,
  moleculeTemplate,
  moleculeNameTemplate,
  collectionTemplate,
  collectionsSampleTemplate,
  collectionsReactionTemplate,
  reactionSampleTemplate,
  containerTemplate,
  datasetTemplate,
} from '@/app/components/zip-download/templates'
import {
  moleculeSchema,
  sampleSchema,
  reactionSchema,
} from '@/app/components/zip-download/zodSchemes'
import { formatReactionDescription } from './exportHelpers'

type ExcelRow = Record<string, string | number | null | undefined>

type SampleRow = {
  identifier: string
  parent?: string
  name?: string
  external_label?: string
  role?: string
  equivalent?: number
  coefficient?: number
  density?: number
  purity?: number
  molarity_value?: number
  molarity_unit?: string
  target_amount_value?: number
  target_amount_unit?: string
  location?: string
  description?: string
  solvent?: string
  smiles?: string
  molfile?: string
}

type ReactionRow = {
  identifier: string
  parent?: string
  name?: string
  description?: string
  status?: string
  temperature?: string
  duration?: string
  rxno?: string
  solvent?: string
}

/**
 * Parses an Excel file and converts it to export.json format
 */
export const parseExcelToExportJson = async (
  file: File,
): Promise<Record<string, unknown>> => {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer)

  // Read all sheets
  const samples = readSheet<SampleRow>(workbook, 'Samples')
  const reactions = readSheet<ReactionRow>(workbook, 'Reactions')

  // Create identifier to UUID mappings
  const collectionId = uuidv4()
  const identifierToUuid: Record<string, string> = {}

  // Assign UUIDs to all identifiers
  samples.forEach((s) => (identifierToUuid[s.identifier] = uuidv4()))
  reactions.forEach((r) => (identifierToUuid[r.identifier] = uuidv4()))

  // Generate current timestamp
  const currentDate = new Date().toISOString()

  // Create Collection
  const Collection = {
    [collectionId]: {
      ...collectionTemplate,
      label: `Excel Import - ${new Date()
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '-')}`,
      created_at: currentDate,
      updated_at: currentDate,
    },
  }

  // Build Container hierarchy map for ancestry calculation
  const containerParentMap: Record<string, string> = {}
  const containerToUuid: Record<string, string> = {}

  // Create Reactions
  const Reaction: Record<string, unknown> = {}
  const CollectionsReaction: Record<string, unknown> = {}
  const ReactionContainers: Record<string, unknown> = {}

  reactions.forEach((rxn) => {
    const rxnUuid = identifierToUuid[rxn.identifier]
    const containerUuid = uuidv4()
    containerToUuid[rxn.identifier] = containerUuid
    containerParentMap[containerUuid] = collectionId

    // Parse temperature
    const temperature = parseTemperature(rxn.temperature)

    // Parse through schema to ensure correct types (like export does)
    const parsedReaction = reactionSchema.parse({
      ...reactionTemplate,
      name: rxn.name || null,
      created_at: currentDate,
      updated_at: currentDate,
      description: rxn.description || null, // Keep as plain text for schema validation
      temperature,
      status: rxn.status || null,
      solvent: rxn.solvent || null,
      duration: rxn.duration || null,
      rxno: rxn.rxno || null,
      plain_text_description: rxn.description || null,
    })

    // Convert description to Delta format after parsing (matches jsonGenerator pattern)
    Reaction[rxnUuid] = {
      ...parsedReaction,
      description: formatReactionDescription(rxn.description),
    }

    CollectionsReaction[uuidv4()] = {
      ...collectionsReactionTemplate,
      collection_id: collectionId,
      reaction_id: rxnUuid,
    }

    ReactionContainers[containerUuid] = {
      ...containerTemplate,
      ancestry: collectionId,
      containable_id: rxnUuid,
      containable_type: 'Reaction',
      name: rxn.name || null,
      container_type: 'root',
      description: rxn.description || null,
      created_at: currentDate,
      updated_at: currentDate,
      parent_id: collectionId,
    }
  })

  // Create Samples and Molecules
  const Sample: Record<string, unknown> = {}
  const CollectionsSample: Record<string, unknown> = {}
  const Molecule: Record<string, unknown> = {}
  const MoleculeName: Record<string, unknown> = {}
  const SampleContainers: Record<string, unknown> = {}

  samples.forEach((smp) => {
    const smpUuid = identifierToUuid[smp.identifier]
    const containerUuid = uuidv4()
    containerToUuid[smp.identifier] = containerUuid

    // Determine parent
    let parentId = collectionId
    if (smp.parent && identifierToUuid[smp.parent]) {
      parentId = containerToUuid[smp.parent]
    }
    containerParentMap[containerUuid] = parentId

    // Calculate ancestry
    const ancestry = buildAncestry(
      containerUuid,
      containerParentMap,
      collectionId,
    )

    // Handle molecule if SMILES or molfile provided
    let moleculeId: string | null = null
    if (smp.smiles || smp.molfile) {
      moleculeId = uuidv4()

      // Parse through schema to ensure correct types (like export does)
      Molecule[moleculeId] = moleculeSchema.parse({
        ...moleculeTemplate,
        density: smp.density ? Number(smp.density) : null,
        molfile: smp.molfile || null,
        cano_smiles: smp.smiles || null,
        created_at: currentDate,
        updated_at: currentDate,
      })

      // Create molecule name entry
      if (smp.name) {
        MoleculeName[uuidv4()] = {
          ...moleculeNameTemplate,
          molecule_id: moleculeId,
          name: smp.name,
          created_at: currentDate,
          updated_at: currentDate,
        }
      }

      // NOTE: Molecule Container entries are NOT created here.
      // importFromZip.ts will auto-create molecule folders for samples
      // with molecule_id or molfile (lines 714-769)
    }

    // Parse through schema to ensure correct types (like export does)
    Sample[smpUuid] = sampleSchema.parse({
      ...sampleTemplate,
      name: smp.name || null,
      decoupled: !moleculeId,
      target_amount_value: smp.target_amount_value
        ? Number(smp.target_amount_value)
        : null,
      target_amount_unit: smp.target_amount_unit || 'mg',
      created_at: currentDate,
      updated_at: currentDate,
      description: smp.description || null,
      molecule_id: moleculeId,
      molfile: smp.molfile || null,
      purity: smp.purity ? Number(smp.purity) : null,
      location: smp.location || null,
      ancestry,
      external_label: smp.external_label || null,
      density: smp.density ? Number(smp.density) : null,
      molarity_value: smp.molarity_value ? Number(smp.molarity_value) : null,
      molarity_unit: smp.molarity_unit || 'M',
      solvent: smp.solvent || null,
    })

    CollectionsSample[uuidv4()] = {
      ...collectionsSampleTemplate,
      collection_id: collectionId,
      sample_id: smpUuid,
    }

    SampleContainers[containerUuid] = {
      ...containerTemplate,
      ancestry,
      containable_id: smpUuid,
      containable_type: 'Sample',
      name: smp.name || null,
      container_type: 'root',
      description: smp.description || null,
      created_at: currentDate,
      updated_at: currentDate,
      parent_id: parentId,
    }
  })

  // Create Reaction Sample links from samples with parent reactions and roles
  const ReactionsStartingMaterialSample: Record<string, unknown> = {}
  const ReactionsReactantSample: Record<string, unknown> = {}
  const ReactionsProductSample: Record<string, unknown> = {}
  const ReactionsSolventSample: Record<string, unknown> = {}

  samples.forEach((smp) => {
    // Only process samples that have a parent reaction and a role
    if (!smp.parent || !smp.role) return

    const reactionId = identifierToUuid[smp.parent]
    const sampleId = identifierToUuid[smp.identifier]

    if (!reactionId || !sampleId) return

    const linkData = {
      ...reactionSampleTemplate,
      reaction_id: reactionId,
      sample_id: sampleId,
      equivalent: smp.equivalent ? Number(smp.equivalent) : null,
      coefficient: smp.coefficient ? Number(smp.coefficient) : 1.0,
    }

    const linkId = uuidv4()
    switch (smp.role) {
      case 'startingMaterial':
        ReactionsStartingMaterialSample[linkId] = linkData
        break
      case 'reactant':
        ReactionsReactantSample[linkId] = linkData
        break
      case 'product':
        ReactionsProductSample[linkId] = linkData
        break
      case 'solvent':
        ReactionsSolventSample[linkId] = linkData
        break
    }
  })

  // Auto-create analyses/analysis/dataset containers for each sample and reaction
  // NOTE: Molecule containers are NOT included here - they are auto-created
  // by importFromZip.ts when processing samples with molecule_id/molfile
  const Container: Record<string, unknown> = {
    ...ReactionContainers,
    ...SampleContainers,
  }
  const Dataset: Record<string, unknown> = {}

  // Helper function to create default analyses structure
  const createAnalysesStructure = (parentContainerId: string) => {
    const parentAncestry = buildAncestry(
      parentContainerId,
      containerParentMap,
      collectionId,
    )

    // 1. Create analyses folder
    const analysesUuid = uuidv4()
    containerParentMap[analysesUuid] = parentContainerId
    const analysesAncestry = `${parentAncestry}/${parentContainerId}`

    Container[analysesUuid] = {
      ...containerTemplate,
      ancestry: analysesAncestry,
      name: 'analyses',
      container_type: 'analyses',
      created_at: currentDate,
      updated_at: currentDate,
      parent_id: parentContainerId,
    }

    // 2. Create default analysis
    const analysisUuid = uuidv4()
    containerParentMap[analysisUuid] = analysesUuid
    const analysisAncestry = `${analysesAncestry}/${analysesUuid}`

    Container[analysisUuid] = {
      ...containerTemplate,
      ancestry: analysisAncestry,
      name: 'analysis',
      container_type: 'analysis',
      extended_metadata: {
        status: null,
        kind: null,
      },
      created_at: currentDate,
      updated_at: currentDate,
      parent_id: analysesUuid,
    }

    // 3. Create default dataset
    const datasetUuid = uuidv4()
    const datasetId = uuidv4()
    containerParentMap[datasetUuid] = analysisUuid
    const datasetAncestry = `${analysisAncestry}/${analysisUuid}`

    Container[datasetUuid] = {
      ...containerTemplate,
      ancestry: datasetAncestry,
      containable_id: datasetId,
      containable_type: 'Dataset',
      name: 'dataset',
      container_type: 'dataset',
      extended_metadata: {
        instrument: null,
      },
      created_at: currentDate,
      updated_at: currentDate,
      parent_id: analysisUuid,
      plain_text_content: null,
    }

    Dataset[datasetId] = {
      ...datasetTemplate,
      name: 'dataset',
      created_at: currentDate,
      updated_at: currentDate,
    }
  }

  // Create analyses structure for each sample
  samples.forEach((smp) => {
    const containerUuid = containerToUuid[smp.identifier]
    createAnalysesStructure(containerUuid)
  })

  // Create analyses structure for each reaction
  reactions.forEach((rxn) => {
    const containerUuid = containerToUuid[rxn.identifier]
    createAnalysesStructure(containerUuid)
  })

  // Assemble export.json
  const exportJson: Record<string, unknown> = {
    Collection,
    Sample,
    CollectionsSample,
    Fingerprint: {},
    Molecule,
    MoleculeName,
    Container,
    Attachment: {},
    Reaction,
    CollectionsReaction,
    ReactionsStartingMaterialSample,
    ReactionsReactantSample,
    ReactionsProductSample,
    ReactionsSolventSample,
    Dataset,
    source: 'smart-add-excel',
  }

  return exportJson
}

/**
 * Reads a sheet from workbook and returns array of rows
 */
function readSheet<T extends ExcelRow>(
  workbook: XLSX.WorkBook,
  sheetName: string,
): T[] {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return []

  const data = XLSX.utils.sheet_to_json<T>(sheet, { defval: undefined })
  // Filter out empty rows
  return data.filter((row) => {
    const values = Object.values(row)
    return values.some((v) => v !== undefined && v !== null && v !== '')
  })
}

/**
 * Parse temperature string to temperature object
 */
function parseTemperature(temp?: string): {
  data: unknown[]
  userText: string | null
  valueUnit: string | null
} {
  if (!temp) {
    return { data: [], userText: null, valueUnit: null }
  }

  return {
    data: [],
    userText: temp,
    valueUnit: '°C',
  }
}

/**
 * Build ancestry string by traversing parent chain
 */
function buildAncestry(
  containerId: string,
  parentMap: Record<string, string>,
  rootId: string,
): string {
  const ancestors: string[] = []
  let currentId = containerId

  while (parentMap[currentId] && parentMap[currentId] !== rootId) {
    ancestors.unshift(parentMap[currentId])
    currentId = parentMap[currentId]
  }

  if (ancestors.length === 0) {
    return rootId
  }

  ancestors.unshift(rootId)
  return ancestors.join('/')
}
