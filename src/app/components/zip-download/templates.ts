/* eslint-disable perfectionist/sort-objects */
export const reactionSampleTemplate = {
  reaction_id: null,
  sample_id: null,
  reference: false,
  equivalent: null,
  position: 0,
  waste: false,
  coefficient: 1.0,
  deleted_at: null,
}

export const collectionTemplate = {
  user_id: null,
  ancestry: '',
  label: '',
  shared_by_id: '',
  is_shared: false,
  permission_level: 0,
  sample_detail_level: 0,
  reaction_detail_level: 0,
  wellplate_detail_level: 0,
  created_at: null,
  updated_at: null,
  position: 0,
  screen_detail_level: 0,
  is_locked: false,
  deleted_at: null,
  is_synchronized: false,
  researchplan_detail_level: 0,
  element_detail_level: 0,
}

export const sampleTemplate = {
  name: null,
  target_amount_value: 0,
  target_amount_unit: '',
  created_at: null,
  updated_at: null,
  description: null,
  molecule_id: null,
  molfile: '',
  purity: null,
  solvent: null,
  impurities: null,
  location: null,
  is_top_secret: false,
  ancestry: '',
  external_label: '',
  created_by: null,
  short_label: '',
  real_amount_value: null,
  real_amount_unit: null,
  imported_readout: null,
  deleted_at: null,
  sample_svg_file: null,
  user_id: null,
  identifier: null,
  density: 0,
  melting_point: null,
  boiling_point: null,
  fingerprint_id: null,
  xref: null,
  molarity_value: 0,
  molarity_unit: null,
  molecule_name_id: null,
  molfile_version: null,
  stereo: null,
}

export const collectionsSampleTemplate = {
  collection_id: null,
  sample_id: null,
  deleted_at: null,
}

export const fingerprintTemplate = {
  fp0: '',
  fp1: '',
  fp2: '',
  fp3: '',
  fp4: '',
  fp5: '',
  fp6: '',
  fp7: '',
  fp8: '',
  fp9: '',
  fp10: '',
  fp11: '',
  fp12: '',
  fp13: '',
  fp14: '',
  fp15: '',
  num_set_bits: 0,
  created_at: null,
  updated_at: null,
  deleted_at: null,
}

export const moleculeTemplate = {
  inchikey: '',
  inchistring: '',
  density: 0,
  molecular_weight: 0,
  molfile: '',
  melting_point: null,
  boiling_point: null,
  sum_formular: '',
  names: [],
  iupac_name: '',
  molecule_svg_file: '',
  created_at: null,
  updated_at: null,
  deleted_at: null,
  is_partial: false,
  exact_molecular_weight: 0,
  cano_smiles: '',
  cas: [],
  molfile_version: null,
}

export const moleculeNameTemplate = {
  molecule_id: null,
  user_id: null,
  description: '',
  name: '',
  created_at: null,
  updated_at: null,
  deleted_at: null,
}

export const residueTemplate = {
  sample_id: null,
  residue_type: '',
  custom_info: null,
  created_at: null,
  updated_at: null,
}

export const reactionTemplate = {
  name: '',
  created_at: null,
  updated_at: null,
  description: { ops: [{ insert: '' }] },
  timestamp_start: '',
  timestamp_stop: '',
  observation: { ops: [{ insert: '' }] },
  purification: [],
  dangerous_products: [],
  tlc_solvents: '',
  tlc_description: '',
  rf_value: '',
  temperature: { data: [], userText: '', valueUnit: '' },
  status: '',
  reaction_svg_file: '',
  solvent: '',
  deleted_at: null,
  short_label: '',
  created_by: null,
  role: '',
  origin: {},
  rinchi_string: '',
  rinchi_long_key: '',
  rinchi_short_key: '',
  rinchi_web_key: '',
  duration: '',
}

export const collectionsReactionTemplate = {
  collection_id: null,
  reaction_id: null,
  deleted_at: null,
}

export const wellplateTemplate = {
  name: '',
  size: 0,
  description: { ops: [] },
  created_at: null,
  updated_at: null,
  deleted_at: null,
}

export const collectionsWellplateTemplate = {
  collection_id: null,
  wellplate_id: null,
  deleted_at: null,
}

export const wellTemplate = {
  sample_id: null,
  wellplate_id: null,
  position_x: 0,
  position_y: 0,
  created_at: null,
  updated_at: null,
  readout: null,
  additive: null,
  deleted_at: null,
}

export const screenTemplate = {
  description: { ops: [] },
  name: '',
  result: '',
  collaborator: '',
  conditions: '',
  requirements: '',
  created_at: null,
  updated_at: null,
  deleted_at: null,
}

export const collectionsScreenTemplate = {
  collection_id: null,
  screen_id: null,
  deleted_at: null,
}

export const screensWellplateTemplate = {
  screen_id: null,
  wellplate_id: null,
  deleted_at: null,
}

export const researchPlanTemplate = {
  name: '',
  description: { ops: [] },
  sdf_file: '',
  svg_file: '',
  created_by: null,
  deleted_at: null,
  created_at: null,
  updated_at: null,
}

export const collectionsResearchPlanTemplate = {
  collection_id: null,
  research_plan_id: null,
  deleted_at: null,
}

export const containerTemplate = {
  ancestry: '',
  containable_id: null,
  containable_type: null,
  name: null,
  container_type: null,
  description: null,
  extended_metadata: null,
  created_at: null,
  updated_at: null,
  parent_id: null,
}

export const attachmentTemplate = {
  attachable_id: null,
  filename: '',
  identifier: null,
  checksum: '',
  storage: '',
  created_by: null,
  created_for: null,
  version: 0,
  created_at: null,
  updated_at: null,
  content_type: '',
  bucket: '',
  key: '',
  thumb: false,
  folder: null,
  attachable_type: '',
  aasm_state: '',
}

export const literalTemplate = {
  literature_id: null,
  element_id: null,
  element_type: '',
  category: '',
  user_id: null,
  created_at: null,
  updated_at: null,
}

export const literatureTemplate = {
  title: '',
  url: '',
  created_at: null,
  updated_at: null,
  deleted_at: null,
  refs: {
    bibtex: '',
  },
  doi: '',
}
