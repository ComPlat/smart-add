import { ExtendedFile, ExtendedFolder } from '@/database/db'
import {
  ZodAny,
  ZodArray,
  ZodBoolean,
  ZodEnum,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodString,
} from 'zod'

export const getTotalLength = (
  files: ExtendedFile[],
  folders: ExtendedFolder[],
  treeRoot: string,
) => {
  const fileFilter = files.filter((file) => file.treeId === treeRoot)
  const folderFilter = folders.filter((folder) => folder.treeId === treeRoot)
  return fileFilter.length + folderFilter.length
}

const readonlyKeys = Object.freeze([
  'name',
  'created_at',
  'updated_at',
  'deleted_at',
  'ancestry',
  'parent_id',
  'fingerprint_id',
  'decoupled',
  'container_type',
])

export const isReadonly = (key: string): boolean => readonlyKeys.includes(key)

// Unit mappings for field names
const fieldUnits: Record<string, string> = {
  density: 'g/mL',
  melting_point: '°C',
  boiling_point: '°C',
  molarity: 'M',
  molecular_mass: 'g/mol',
  molecular_weight: 'g/mol',
  exact_molecular_weight: 'g/mol',
}

export const formatLabel = (text: string): string => {
  const formatted = text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  // Add unit if available
  const unit = fieldUnits[text]
  return unit ? `${formatted} (${unit})` : formatted
}

export function identifyType<T extends ZodRawShape>(
  schema: ZodObject<T>,
  key: keyof T,
): [
  (
    | 'array'
    | 'boolean'
    | 'enum'
    | 'null'
    | 'number'
    | 'object'
    | 'string'
    | 'unknown'
  ),
  boolean,
] {
  const field = schema.shape[key]
  if (field instanceof ZodOptional || field instanceof ZodNullable) {
    return [identifyTypeName(field.unwrap() as unknown as ZodType), true]
  } else {
    return [identifyTypeName(field as unknown as ZodType), false]
  }
}

type ZodType =
  | ZodAny
  | ZodArray<ZodString>
  | ZodBoolean
  | ZodEnum<any>
  | ZodNull
  | ZodNumber
  | ZodObject<any>
  | ZodString

export function identifyTypeName(
  type: ZodType,
):
  | 'array'
  | 'boolean'
  | 'enum'
  | 'null'
  | 'number'
  | 'object'
  | 'string'
  | 'unknown' {
  if (type instanceof ZodString) {
    return 'string'
  } else if (type instanceof ZodNumber) {
    return 'number'
  } else if (type instanceof ZodBoolean) {
    return 'boolean'
  } else if (type instanceof ZodNull) {
    return 'null'
  } else if (type instanceof ZodAny) {
    return 'object'
  } else if (type instanceof ZodObject) {
    return 'object'
  } else if (type instanceof ZodEnum) {
    return 'enum'
  } else if (type instanceof ZodArray) {
    return 'array'
  } else {
    return 'unknown'
  }
}
const hiddenKeys = Object.freeze([
  //Hidden keys for Sample
  'created_at',
  'updated_at',
  'deleted_at',
  'molecule_id',
  'is_top_secret',
  'ancestry',
  'fingerprint_id',
  'xref',
  'molecule_name_id',
  'created_by',
  'sample_svg_file',
  'user_id',
  'identifier',
  'molfile_version',
  'mol_rdkit',
  'molecular_mass',
  'containable_id',
  'containable_type',
  'parent_id',
  'plain_text_content',
  'impurities',
  'short_label',
  'imported_readout',
  'deprecated_solvent',
  'metrics',
  'sum_formula',
  'real_amount_value',
  //Hidden keys for Reaction
  'reaction_svg_file',
  'rinchi_long_key',
  'rinchi_string',
  'rinchi_web_key',
  'rinchi_short_key',
  'origin',
  'duration',
  'content',
  'conditions',
  'variations',
  'temperature',
  'observation',
])

export const isHidden = (key: string): boolean => hiddenKeys.includes(key)

// Extended metadata field mapping by container type
const extendedMetadataFields = Object.freeze({
  analysis: ['status', 'kind'],
  dataset: ['instrument'],
} as const)

export const isExtendedMetadataField = (
  containerType: string,
  key: string,
): boolean => {
  const fields =
    extendedMetadataFields[containerType as keyof typeof extendedMetadataFields]
  return fields ? (fields as readonly string[]).includes(key) : false
}

const textAreaKeys = Object.freeze(['description', 'molfile'])

export const isTextArea = (key: string): boolean => textAreaKeys.includes(key)

const quantityValueKeys = Object.freeze([
  'target_amount_value',
  'real_amount_value',
  'molarity_value',
])

export const isQuantityValue = (key: string): boolean =>
  quantityValueKeys.includes(key)

export const getQuantityUnitKey = (valueKey: string): string | null => {
  if (!isQuantityValue(valueKey)) return null
  return valueKey.replace('_value', '_unit')
}

export const isQuantityUnit = (key: string): boolean => {
  if (!key.endsWith('_unit')) return false
  const valueKey = key.replace('_unit', '_value')
  return isQuantityValue(valueKey)
}
