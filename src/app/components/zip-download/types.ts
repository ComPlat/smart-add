/* eslint-disable perfectionist/sort-union-types */
/* eslint-disable perfectionist/sort-interfaces */

type UUID = string
type Datetime = string

export interface ReactionSample {
  reaction_id: UUID
  sample_id: UUID
  reference: boolean
  equivalent: number | null
  position: number
  waste: boolean
  coefficient: number
  deleted_at: null
}

export interface Collection {
  user_id: UUID
  ancestry: string
  label: string
  shared_by_id: UUID
  is_shared: boolean
  permission_level: number
  sample_detail_level: number
  reaction_detail_level: number
  wellplate_detail_level: number
  created_at: Datetime
  updated_at: Datetime
  position: number
  screen_detail_level: number
  is_locked: boolean
  deleted_at: null
  is_synchronized: boolean
  researchplan_detail_level: number
}

export interface Sample {
  name: string | null
  target_amount_value: number
  target_amount_unit: string
  created_at: Datetime
  updated_at: Datetime
  description: string | null
  molecule_id: UUID
  molfile: string
  purity: number | null
  solvent: string | null
  impurities: string | null
  location: string | null
  is_top_secret: boolean
  ancestry: string
  external_label: string
  created_by: UUID
  short_label: string
  real_amount_value: number | null
  real_amount_unit: string | null
  imported_readout: string | null
  deleted_at: null
  sample_svg_file: string | null
  user_id: UUID
  identifier: string | null
  density: number
  melting_point: number | null
  boiling_point: number | null
  fingerprint_id: UUID
  xref: object | null
  molarity_value: number
  molarity_unit: string | null
  molecule_name_id: UUID
  molfile_version: string | null
  stereo: object
}

export interface CollectionsSample {
  collection_id: UUID
  sample_id: UUID
  deleted_at: null
}

export interface Fingerprint {
  fp0: string
  fp1: string
  fp2: string
  fp3: string
  fp4: string
  fp5: string
  fp6: string
  fp7: string
  fp8: string
  fp9: string
  fp10: string
  fp11: string
  fp12: string
  fp13: string
  fp14: string
  fp15: string
  num_set_bits: number
  created_at: Datetime
  updated_at: Datetime
  deleted_at: null
}

export interface Molecule {
  inchikey: string
  inchistring: string
  density: number
  molecular_weight: number
  molfile: string
  melting_point: number | null
  boiling_point: number | null
  sum_formular: string
  names: string[]
  iupac_name: string
  molecule_svg_file: string
  created_at: Datetime
  updated_at: Datetime
  deleted_at: null
  is_partial: boolean
  exact_molecular_weight: number
  cano_smiles: string
  cas: string[]
  molfile_version: string
}

export interface MoleculeName {
  molecule_id: UUID
  user_id: UUID
  description: string
  name: string
  created_at: Datetime
  updated_at: Datetime
  deleted_at: null
}

export interface Residue {
  sample_id: UUID
  residue_type: string
  custom_info: object
  created_at: Datetime
  updated_at: Datetime
}

export interface Reaction {
  name: string
  created_at: Datetime
  updated_at: Datetime
  description: TextObject
  timestamp_start: string
  timestamp_stop: string
  observation: TextObject
  purification: object[]
  dangerous_products: object[]
  tlc_solvents: string
  tlc_description: string
  rf_value: string
  temperature: TemperatureObject
  status: string
  reaction_svg_file: string
  solvent: string
  deleted_at: null
  short_label: string
  created_by: UUID
  role: string
  origin: object
  rinchi_string: string
  rinchi_long_key: string
  rinchi_short_key: string
  rinchi_web_key: string
  duration: string
}

interface TextObject {
  ops: Array<{ insert: string }>
}

interface TemperatureObject {
  data: object[]
  userText: string
  valueUnit: string
}

export interface CollectionsReaction {
  collection_id: UUID
  reaction_id: UUID
  deleted_at: null
}

export interface Wellplate {
  name: string
  size: number
  description: TextObject
  created_at: Datetime
  updated_at: Datetime
  deleted_at: null
}

export interface CollectionsWellplate {
  collection_id: UUID
  wellplate_id: UUID
  deleted_at: null
}

export interface Well {
  sample_id: UUID
  wellplate_id: UUID
  position_x: number
  position_y: number
  created_at: Datetime
  updated_at: Datetime
  readout: string | null
  additive: string | null
  deleted_at: null
}

export interface Screen {
  description: TextObject
  name: string
  result: string
  collaborator: string
  conditions: string
  requirements: string
  created_at: Datetime
  updated_at: Datetime
  deleted_at: null
}

export interface CollectionsScreen {
  collection_id: UUID
  screen_id: UUID
  deleted_at: null
}

export interface ScreensWellplate {
  screen_id: UUID
  wellplate_id: UUID
  deleted_at: null
}

export interface ResearchPlan {
  name: string
  description: TextObject
  sdf_file: string
  svg_file: string
  created_by: UUID
  deleted_at: null
  created_at: Datetime
  updated_at: Datetime
}

export interface CollectionsResearchPlan {
  collection_id: UUID
  research_plan_id: UUID
  deleted_at: null
}

export interface Container {
  ancestry: string
  containable_id: UUID
  containable_type: string | null
  name: string | null
  container_type: string | null
  description: string | null
  extended_metadata: object
  created_at: Datetime
  updated_at: Datetime
  parent_id: UUID
}

export interface Attachment {
  attachable_id: UUID
  filename: string
  identifier: UUID
  checksum: string
  storage: string
  created_by: UUID
  created_for: UUID
  version: number
  created_at: Datetime
  updated_at: Datetime
  content_type: string
  bucket: string
  key: string
  thumb: boolean
  folder: string | null
  attachable_type: string
  aasm_state: string
}

export interface Literal {
  literature_id: UUID
  element_id: UUID
  element_type: string
  category: string
  user_id: UUID
  created_at: Datetime
  updated_at: Datetime
}

export interface Literature {
  title: string
  url: string
  created_at: Datetime
  updated_at: Datetime
  deleted_at: null
  refs: {
    bibtex: string
  }
  doi: string
}
