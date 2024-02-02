/* eslint-disable perfectionist/sort-objects */
import { z } from 'zod'

const uuidSchema = z.string().nullable()

const datetimeSchema = z.string()

export const reactionSampleSchema = z.object({
  reaction_id: uuidSchema,
  sample_id: uuidSchema,
  reference: z.boolean(),
  equivalent: z.number().nullable(),
  position: z.number(),
  waste: z.boolean(),
  coefficient: z.number(),
  deleted_at: z.null(),
})
export type ReactionSample = z.infer<typeof reactionSampleSchema>

export const collectionSchema = z.object({
  user_id: uuidSchema,
  ancestry: z.string(),
  label: z.string(),
  shared_by_id: uuidSchema,
  is_shared: z.boolean(),
  permission_level: z.number(),
  sample_detail_level: z.number(),
  reaction_detail_level: z.number(),
  wellplate_detail_level: z.number(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  position: z.number(),
  screen_detail_level: z.number(),
  is_locked: z.boolean(),
  deleted_at: z.null(),
  is_synchronized: z.boolean(),
  researchplan_detail_level: z.number(),
})
export type Collection = z.infer<typeof collectionSchema>

export const sampleSchema = z.object({
  name: z.string().nullable(),
  target_amount_value: z.number(),
  target_amount_unit: z.string(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  description: z.string().nullable(),
  molecule_id: uuidSchema,
  molfile: z.string(),
  purity: z.number().nullable(),
  solvent: z.string().nullable(),
  impurities: z.string().nullable(),
  location: z.string().nullable(),
  is_top_secret: z.boolean(),
  ancestry: z.string(),
  external_label: z.string(),
  created_by: uuidSchema,
  short_label: z.string(),
  real_amount_value: z.number().nullable(),
  real_amount_unit: z.string().nullable(),
  imported_readout: z.string().nullable(),
  deleted_at: z.null(),
  sample_svg_file: z.string().nullable(),
  user_id: uuidSchema,
  identifier: z.string().nullable(),
  density: z.number(),
  melting_point: z.number().nullable(),
  boiling_point: z.number().nullable(),
  fingerprint_id: uuidSchema,
  xref: z.any().nullable(),
  molarity_value: z.number(),
  molarity_unit: z.string().nullable(),
  molecule_name_id: uuidSchema,
  molfile_version: z.string().nullable(),
  stereo: z.any(),
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
  inchikey: z.string(),
  inchistring: z.string(),
  density: z.number(),
  molecular_weight: z.number(),
  molfile: z.string(),
  melting_point: z.number().nullable(),
  boiling_point: z.number().nullable(),
  sum_formular: z.string(),
  names: z.array(z.string()),
  iupac_name: z.string(),
  molecule_svg_file: z.string(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  deleted_at: z.null(),
  is_partial: z.boolean(),
  exact_molecular_weight: z.number(),
  cano_smiles: z.string(),
  cas: z.array(z.string()),
  molfile_version: z.string(),
})
export type Molecule = z.infer<typeof moleculeSchema>

export const moleculeNameSchema = z.object({
  molecule_id: uuidSchema,
  user_id: uuidSchema,
  description: z.string(),
  name: z.string(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  deleted_at: z.null(),
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

const textObjectSchema = z.object({
  ops: z.array(
    z.object({
      insert: z.string(),
    }),
  ),
})

const temperatureObjectSchema = z.object({
  data: z.array(z.any()),
  userText: z.string(),
  valueUnit: z.string(),
})

export const collectionsReactionSchema = z.object({
  collection_id: uuidSchema,
  reaction_id: uuidSchema,
  deleted_at: z.null(),
})
export type CollectionsReaction = z.infer<typeof collectionsReactionSchema>

export const wellplateSchema = z.object({
  name: z.string(),
  size: z.number(),
  description: textObjectSchema,
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
  readout: z.string().nullable(),
  additive: z.string().nullable(),
  deleted_at: z.null(),
})
export type Well = z.infer<typeof wellSchema>

export const screenSchema = z.object({
  description: textObjectSchema,
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
  description: textObjectSchema,
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
  containable_type: z.string().nullable(),
  name: z.string().nullable(),
  container_type: z.string().nullable(),
  description: z.string().nullable(),
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
  version: z.number(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  content_type: z.string(),
  bucket: z.string(),
  key: z.string(),
  thumb: z.boolean(),
  folder: z.string().nullable(),
  attachable_type: z.string(),
  aasm_state: z.string(),
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
  name: z.string(),
  created_at: datetimeSchema.transform((val) => val ?? null),
  updated_at: datetimeSchema,
  description: textObjectSchema,
  timestamp_start: z.string(),
  timestamp_stop: z.string(),
  observation: textObjectSchema,
  purification: z.array(z.any()),
  dangerous_products: z.array(z.any()),
  tlc_solvents: z.string(),
  tlc_description: z.string(),
  rf_value: z.string(),
  temperature: temperatureObjectSchema,
  status: z.string(),
  reaction_svg_file: z.string(),
  solvent: z.string(),
  deleted_at: z.null(),
  short_label: z.string(),
  created_by: uuidSchema,
  role: z.string(),
  origin: z.any(),
  rinchi_string: z.string(),
  rinchi_long_key: z.string(),
  rinchi_short_key: z.string(),
  rinchi_web_key: z.string(),
  duration: z.string(),
})
export type Reaction = z.infer<typeof reactionSchema>
