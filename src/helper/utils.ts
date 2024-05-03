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
  key: string,
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
  if (
    schema.shape[key] instanceof ZodOptional ||
    schema.shape[key] instanceof ZodNullable
  ) {
    return [identifyTypeName(schema.shape[key].unwrap()), true]
  } else {
    return [identifyTypeName(schema.shape[key]), false]
  }
}

type ZodType =
  | ZodAny
  | ZodArray<ZodString>
  | ZodBoolean
  | ZodEnum<[string, ...string[]]>
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
