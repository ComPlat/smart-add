/* eslint-disable perfectionist/sort-objects */
import { Metadata } from '@/database/db'
import { ZodObject, ZodRawShape, z } from 'zod'

const uuidSchema = z.string().nullable()
const nullableString = z.string().nullable()
const nullableNumber = z.number().nullable()

export const datetimeSchema = z.string().datetime()
export type DateTime = z.infer<typeof datetimeSchema>

const temperatureObjectSchema = z.object({
  data: z.array(z.any()),
  userText: nullableString,
  valueUnit: nullableString,
})
export type TemperatureObject = z.infer<typeof temperatureObjectSchema>

const textObjectSchema = z.object({
  ops: z.array(z.object({ insert: z.string() })).default([{ insert: '\n' }]),
})
export type TextObject = z.infer<typeof textObjectSchema>

const arraySchema = z.array(z.union([z.string(), z.number()]))
export type ArrayType = z.infer<typeof arraySchema>

export const reactionSampleSchema = z.object({
  reaction_id: uuidSchema,
  sample_id: uuidSchema,
  reference: z.boolean(),
  equivalent: nullableNumber,
  position: z.number(),
  waste: z.boolean(),
  coefficient: z.number(),
  deleted_at: z.null(),
})
export type ReactionSample = z.infer<typeof reactionSampleSchema>

export const collectionSchema = z.object({
  user_id: uuidSchema,
  ancestry: nullableString,
  label: z.string(),
  shared_by_id: uuidSchema,
  is_shared: z.boolean().nullable(),
  permission_level: nullableNumber,
  sample_detail_level: z.number(),
  reaction_detail_level: z.number(),
  wellplate_detail_level: z.number(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  position: nullableNumber,
  screen_detail_level: z.number(),
  is_locked: z.boolean(),
  deleted_at: z.null(),
  is_synchronized: z.boolean(),
  researchplan_detail_level: z.number(),
  element_detail_level: z.number(),
})
export type Collection = z.infer<typeof collectionSchema>

export const sampleSchema = z.object({
  name: nullableString,
  target_amount_value: nullableNumber,
  target_amount_unit: nullableString,
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  description: nullableString,
  molecule_id: uuidSchema,
  molfile: nullableString,
  purity: nullableNumber,
  deprecated_solvent: nullableString,
  dry_solvent: z.boolean(),
  impurities: nullableString,
  location: nullableString,
  is_top_secret: z.boolean(),
  ancestry: nullableString,
  external_label: nullableString,
  created_by: uuidSchema,
  short_label: nullableString,
  real_amount_value: nullableNumber,
  real_amount_unit: nullableString,
  imported_readout: nullableString,
  deleted_at: z.null(),
  sample_svg_file: nullableString,
  user_id: uuidSchema,
  identifier: nullableString,
  density: nullableNumber,
  melting_point: nullableString,
  boiling_point: nullableString,
  fingerprint_id: uuidSchema,
  xref: z.any().nullable(),
  molarity_value: nullableNumber,
  molarity_unit: nullableString,
  molecule_name_id: uuidSchema,
  molfile_version: nullableString,
  stereo: z.any(),
  mol_rdkit: nullableString,
  metrics: nullableString,
  decoupled: z.boolean(),
  molecular_mass: nullableNumber,
  sum_formula: nullableString,
  solvent: z.union([nullableString, z.array(z.string())]),
})
export type Sample = z.infer<typeof sampleSchema>

export const collectionsSampleSchema = z.object({
  collection_id: uuidSchema,
  sample_id: uuidSchema,
  deleted_at: z.null(),
})
export type CollectionsSample = z.infer<typeof collectionsSampleSchema>

export const fingerprintSchema = z.object({
  fp0: z.string(),
  fp1: z.string(),
  fp2: z.string(),
  fp3: z.string(),
  fp4: z.string(),
  fp5: z.string(),
  fp6: z.string(),
  fp7: z.string(),
  fp8: z.string(),
  fp9: z.string(),
  fp10: z.string(),
  fp11: z.string(),
  fp12: z.string(),
  fp13: z.string(),
  fp14: z.string(),
  fp15: z.string(),
  num_set_bits: z.number(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  deleted_at: z.null(),
})
export type Fingerprint = z.infer<typeof fingerprintSchema>

export const moleculeSchema = z.object({
  inchikey: nullableString,
  inchistring: nullableString,
  density: nullableNumber,
  molecular_weight: nullableNumber,
  molfile: nullableString,
  melting_point: nullableNumber,
  boiling_point: nullableNumber,
  sum_formular: nullableString,
  names: z.array(z.string()).nullable(),
  iupac_name: nullableString,
  molecule_svg_file: nullableString,
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  deleted_at: z.null(),
  is_partial: z.boolean(),
  exact_molecular_weight: nullableNumber,
  cano_smiles: nullableString,
  cas: z.array(z.string()).nullable(),
  molfile_version: nullableString,
})
export type Molecule = z.infer<typeof moleculeSchema>

export const moleculeNameSchema = z.object({
  molecule_id: uuidSchema,
  user_id: uuidSchema,
  description: nullableString,
  name: z.string(),
  deleted_at: z.null(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
})
export type MoleculeName = z.infer<typeof moleculeNameSchema>

export const residueSchema = z.object({
  sample_id: uuidSchema,
  residue_type: z.string(),
  custom_info: z.any(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
})
export type Residue = z.infer<typeof residueSchema>

export const collectionsReactionSchema = z.object({
  collection_id: uuidSchema,
  reaction_id: uuidSchema,
  deleted_at: z.null(),
})
export type CollectionsReaction = z.infer<typeof collectionsReactionSchema>

export const wellplateSchema = z.object({
  name: z.string(),
  size: z.number(),
  description: nullableString,
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  deleted_at: z.null(),
})
export type Wellplate = z.infer<typeof wellplateSchema>

export const collectionsWellplateSchema = z.object({
  collection_id: uuidSchema,
  wellplate_id: uuidSchema,
  deleted_at: z.null(),
})
export type CollectionsWellplate = z.infer<typeof collectionsWellplateSchema>

export const wellSchema = z.object({
  sample_id: uuidSchema,
  wellplate_id: uuidSchema,
  position_x: z.number(),
  position_y: z.number(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  readout: nullableString,
  additive: nullableString,
  deleted_at: z.null(),
})
export type Well = z.infer<typeof wellSchema>

export const screenSchema = z.object({
  description: nullableString,
  name: z.string(),
  result: z.string(),
  collaborator: z.string(),
  conditions: z.string(),
  requirements: z.string(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  deleted_at: z.null(),
})
export type Screen = z.infer<typeof screenSchema>

export const collectionsScreenSchema = z.object({
  collection_id: uuidSchema,
  screen_id: uuidSchema,
  deleted_at: z.null(),
})
export type CollectionsScreen = z.infer<typeof collectionsScreenSchema>

export const screensWellplateSchema = z.object({
  screen_id: uuidSchema,
  wellplate_id: uuidSchema,
  deleted_at: z.null(),
})
export type ScreensWellplate = z.infer<typeof screensWellplateSchema>

export const researchPlanSchema = z.object({
  name: z.string(),
  description: nullableString,
  sdf_file: z.string(),
  svg_file: z.string(),
  created_by: uuidSchema,
  deleted_at: z.null(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
})
export type ResearchPlan = z.infer<typeof researchPlanSchema>

export const collectionsResearchPlanSchema = z.object({
  collection_id: uuidSchema,
  research_plan_id: uuidSchema,
  deleted_at: z.null(),
})
export type CollectionsResearchPlan = z.infer<
  typeof collectionsResearchPlanSchema
>

export const containerSchema = z.object({
  ancestry: z.string(),
  containable_id: uuidSchema,
  containable_type: nullableString,
  name: nullableString,
  container_type: nullableString,
  description: nullableString,
  extended_metadata: z.any(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  parent_id: uuidSchema,
})
export type Container = z.infer<typeof containerSchema>

export const attachmentSchema = z.object({
  attachable_id: uuidSchema,
  filename: z.string(),
  identifier: uuidSchema,
  checksum: z.string(),
  storage: z.string(),
  created_by: uuidSchema,
  created_for: uuidSchema,
  version: nullableNumber,
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  con_state: nullableNumber,
  content_type: z.string(),
  edit_state: nullableNumber,
  bucket: nullableString,
  key: z.string(),
  thumb: z.boolean(),
  folder: nullableString,
  attachable_type: z.string(),
  aasm_state: z.string(),
  filesize: z.number(),
  attachment_data: z.object({
    id: uuidSchema,
    metadata: z.object({
      filename: z.string(),
      md5: z.string(),
      mime_type: z.string(),
      size: z.number(),
    }),
    storage: z.string(),
  }),
})
export type Attachment = z.infer<typeof attachmentSchema>

export const literalSchema = z.object({
  literature_id: uuidSchema,
  element_id: uuidSchema,
  element_type: z.string(),
  category: z.string(),
  user_id: uuidSchema,
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
})
export type Literal = z.infer<typeof literalSchema>

export const literatureSchema = z.object({
  title: z.string(),
  url: z.string(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  deleted_at: z.null(),
  refs: z.object({
    bibtex: z.string(),
  }),
  doi: z.string(),
})
export type Literature = z.infer<typeof literatureSchema>

export const reactionSchema = z.object({
  name: nullableString,
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  description: nullableString,
  timestamp_start: nullableString,
  timestamp_stop: nullableString,
  observation: nullableString,
  purification: arraySchema,
  dangerous_products: arraySchema,
  tlc_solvents: nullableString,
  tlc_description: nullableString,
  rf_value: nullableString,
  temperature: temperatureObjectSchema,
  status: nullableString,
  reaction_svg_file: nullableString,
  solvent: nullableString,
  deleted_at: z.null(),
  short_label: nullableString,
  created_by: uuidSchema,
  role: nullableString,
  origin: z.any(),
  rinchi_string: nullableString,
  rinchi_long_key: nullableString,
  rinchi_short_key: nullableString,
  rinchi_web_key: nullableString,
  duration: nullableString,
  rnxo: nullableString,
  conditions: nullableString,
  variations: nullableString,
})
export type Reaction = z.infer<typeof reactionSchema>

export const reactionsWorksheetTableSchema = z.object({
  'r short label': nullableString,
  description: nullableString,
  temperature: nullableString,
  duration: nullableString,
})
export type ReactionsWorksheetTable = z.infer<
  typeof reactionsWorksheetTableSchema
>

export const sampleWorksheetTableSchema = z.object({
  'molecule name': nullableString,
  'sample name': nullableString,
  'sample external label': nullableString,
  'short label': nullableString,
  description: nullableString,
  'real amount': nullableString,
  'real unit': nullableString,
  'target amount': nullableString,
  'target unit': nullableString,
  molarity_value: nullableString,
  density: nullableString,
  molfile: nullableString,
  solvent: nullableString,
  location: nullableString,
  secret: nullableString,
  'sample readout': nullableString,
  'melting pt': nullableString,
  'boiling pt': nullableString,
  created_at: nullableString,
  updated_at: nullableString,
  user_labels: nullableString,
  literatures: nullableString,
  'canonical smiles': nullableString,
  'residue type': nullableString,
  decoupled: nullableString,
  'molecular mass (decoupled)': nullableString,
  'sum formula (decoupled)': nullableString,
  'stereo abs': nullableString,
  'stereo rel': nullableString,
  'cas|image': nullableString,
})
export type SampleWorksheetTable = z.infer<typeof sampleWorksheetTableSchema>

export const sampleAnalysesTableSchema = z.object({
  'sample name': nullableString,
  'sample external label': nullableString,
  'short label': nullableString,
  name: nullableString,
  description: nullableString,
  uuid: nullableString,
  kind: nullableString,
  status: nullableString,
  content: nullableString,
  'dataset name': nullableString,
  instrument: nullableString,
  'dataset description': nullableString,
  filename: nullableString,
  checksum: nullableString,
})
export type SampleAnalysesWorksheetTable = z.infer<
  typeof sampleAnalysesTableSchema
>

export const ReactionSchemeSchema = z.object({
  reaction_id: nullableString,
  sample_id: nullableString,
  reference: z.boolean(),
  equivalent: nullableString,
  position: nullableNumber,
  deleted_at: datetimeSchema,
  waste: z.boolean(),
  coefficient: nullableNumber,
  show_label: z.boolean(),
})
export type ReactionScheme = z.infer<typeof ReactionSchemeSchema>

const allSchemas = [
  uuidSchema,
  nullableString,
  datetimeSchema,
  reactionSampleSchema,
  collectionSchema,
  sampleSchema,
  collectionsSampleSchema,
  fingerprintSchema,
  moleculeSchema,
  moleculeNameSchema,
  residueSchema,
  nullableString,
  temperatureObjectSchema,
  collectionsReactionSchema,
  wellplateSchema,
  collectionsWellplateSchema,
  wellSchema,
  screenSchema,
  collectionsScreenSchema,
  screensWellplateSchema,
  researchPlanSchema,
  collectionsResearchPlanSchema,
  containerSchema,
  attachmentSchema,
  literalSchema,
  literatureSchema,
  arraySchema,
  reactionSchema,
  reactionsWorksheetTableSchema,
  sampleWorksheetTableSchema,
  sampleAnalysesTableSchema,
  ReactionSchemeSchema,
]

export const determineSchema = <T extends ZodRawShape>(
  metadata: Metadata,
): ZodObject<T> | undefined => {
  const schema = allSchemas.find((schema) => {
    const result = schema.safeParse(metadata)
    return result.success && schema instanceof ZodObject
  }) as ZodObject<T> | undefined

  return schema
}
