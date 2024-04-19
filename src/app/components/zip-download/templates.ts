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
  ancestry: null,
  label: '',
  shared_by_id: null,
  is_shared: null,
  permission_level: null,
  sample_detail_level: 0,
  reaction_detail_level: 0,
  wellplate_detail_level: 0,
  created_at: null,
  updated_at: null,
  position: null,
  screen_detail_level: 0,
  is_locked: null,
  deleted_at: null,
  is_synchronized: null,
  researchplan_detail_level: 0,
  element_detail_level: 0,
}

export const sampleTemplate = {
  name: null,
  target_amount_value: null,
  target_amount_unit: null,
  created_at: null,
  updated_at: null,
  description: null,
  molecule_id: null,
  molfile: '',
  purity: null,
  deprecated_solvent: null,
  impurities: null,
  location: null,
  is_top_secret: false,
  ancestry: null,
  external_label: null,
  created_by: null,
  short_label: null,
  real_amount_value: null,
  real_amount_unit: null,
  imported_readout: null,
  deleted_at: null,
  sample_svg_file: null,
  user_id: null,
  identifier: null,
  density: null,
  melting_point: null,
  boiling_point: null,
  fingerprint_id: null,
  xref: null,
  molarity_value: null,
  molarity_unit: null,
  molecule_name_id: null,
  molfile_version: null,
  stereo: null,
  mol_rdkit: null,
  metrics: null,
  decoupled: false,
  molecular_mass: null,
  sum_formula: null,
  solvent: null,
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
  inchikey: null,
  inchistring: null,
  density: null,
  molecular_weight: null,
  molfile: '',
  melting_point: null,
  boiling_point: null,
  sum_formular: null,
  names: null,
  iupac_name: null,
  molecule_svg_file: null,
  created_at: null,
  updated_at: null,
  deleted_at: null,
  is_partial: null,
  exact_molecular_weight: null,
  cano_smiles: null,
  cas: null,
  molfile_version: null,
}

export const moleculeNameTemplate = {
  molecule_id: null,
  user_id: null,
  description: null,
  name: null,
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
  name: null,
  created_at: null,
  updated_at: null,
  description: null,
  timestamp_start: null,
  timestamp_stop: null,
  observation: null,
  purification: [],
  dangerous_products: [],
  tlc_solvents: null,
  tlc_description: null,
  rf_value: null,
  temperature: {
    data: [],
    userText: null,
    valueUnit: null,
  },
  status: null,
  reaction_svg_file: null,
  solvent: null,
  deleted_at: null,
  short_label: null,
  created_by: null,
  role: null,
  origin: null,
  rinchi_string: null,
  rinchi_long_key: null,
  rinchi_short_key: null,
  rinchi_web_key: null,
  duration: null,
  rnxo: null,
  conditions: null,
  variations: null,
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
  extended_metadata: {},
  created_at: null,
  updated_at: null,
  parent_id: null,
}

export const datasetTemplate = {
  ...containerTemplate,
  container_type: 'dataset',
  description: '',
  name: 'new',
}

export const attachmentTemplate = {
  attachable_id: '',
  filename: '',
  identifier: '',
  checksum: '',
  storage: 'local',
  created_by: null,
  created_for: null,
  version: null,
  created_at: new Date(),
  updated_at: new Date(),
  content_type: '',
  bucket: null,
  key: '',
  thumb: false,
  folder: null,
  attachable_type: '',
  aasm_state: '',
  filesize: 0,
  attachment_data: null,
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
