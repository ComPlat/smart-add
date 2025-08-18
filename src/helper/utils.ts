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
  'created_at',
  'updated_at',
  'deleted_at',
  'ancestry',
  'parent_id',
  'fingerprint_id',
  'decoupled',
  'name',
])

export const isReadonly = (key: string): boolean => readonlyKeys.includes(key)

export const formatLabel = (text: string): string =>
  text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

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
  } else if (type instanceof ZodEnum) {
    return 'enum'
  } else if (type instanceof ZodArray) {
    return 'array'
  } else {
    return 'unknown'
  }
}
