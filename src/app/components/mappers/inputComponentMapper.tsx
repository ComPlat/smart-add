import { ExtendedFile, ExtendedFolder, MetadataValue } from '@/database/db'
import { FileNode } from '@/helper/types'
import {
  identifyType,
  isReadonly,
  isTextArea,
  isQuantityValue,
  isQuantityUnit,
  getQuantityUnitKey,
} from '@/helper/utils'
import { ChangeEvent } from 'react'
import { ZodObject, ZodRawShape } from 'zod'
import dynamic from 'next/dynamic'

import ArrayInputField from '../input-components/ArrayInputField'
import AutoCompleteField from '../input-components/AutoCompleteField'
import CheckboxField from '../input-components/CheckboxField'
import DateInputField from '../input-components/DateInputField'
import FileUploadInputField from '../input-components/FileUploadInputField'
import NumberInputField from '../input-components/NumberInputField'
import QuantityInputField from '../input-components/QuantityInputField'
import SelectField from '../input-components/SelectField'
import SmilesInputField from '../input-components/SmilesInputField'
import SolventInputField, {
  SolventItem,
} from '../input-components/SolventInputField'
import StereoSelectField from '../input-components/StereoSelectField'
import TextAreaInputField from '../input-components/TextAreaInputField'
import TextInputField from '../input-components/TextInputField'
import OntologyTreeSelect from '../input-components/OntologyTreeSelect'
import {
  tlcSolventsOptions,
  statusOptions,
  analysisStatusOptions,
  roleOptions,
} from '../input-components/selectOptions'

// Dynamically import ReactQuill with SSR disabled to avoid "document is not defined" error
const ReactQuill = dynamic(() => import('../input-components/ReactQuill'), {
  ssr: false,
  loading: () => <div className="p-2 text-gray-500">Loading editor...</div>,
})

interface ComponentMapperProps<T extends ZodRawShape> {
  key: string
  value: MetadataValue
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => void
  handleSelectChange: (e: ChangeEvent<HTMLSelectElement>, key: string) => void
  handleArrayChange: (newValues: string[], key: string) => Promise<void>
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>
  schema?: ZodObject<T>
  metadata?: Record<string, MetadataValue>
  isMolValid?: boolean
  onMolValidationChange?: (isValid: boolean) => void
  currentItem?: ExtendedFile | ExtendedFolder | null
  tree?: Record<string, FileNode>
}

const specialFieldTypes: Record<string, string> = {
  solvent: 'solvent',
  tlc_solvents: 'tlc_solvents',
  status: 'status',
  role: 'role',
  instrument: 'string',
  kind: 'kind',
  rxno: 'rxno',
  molfile: 'molfile',
  cano_smiles: 'cano_smiles',
}

export function determineInputComponent<T extends ZodRawShape>({
  key,
  value,
  handleInputChange,
  handleSelectChange,
  handleArrayChange,
  updateMetadata,
  schema,
  metadata,
  isMolValid,
  onMolValidationChange,
  currentItem,
  tree,
}: ComponentMapperProps<T>) {
  if (!schema) return null

  const [type] = identifyType(schema, key)
  const readonly = key === 'decoupled' ? !isMolValid : isReadonly(key)

  if (isQuantityUnit(key)) {
    return null
  }

  // Check if value is a textObject (Delta format with 'ops')
  const isTextObject = value && typeof value === 'object' && 'ops' in value

  let componentType: string = type
  if (isQuantityValue(key)) {
    componentType = 'quantity'
  } else if (key === 'stereo' && value && typeof value === 'object') {
    componentType = 'stereo'
  } else if (key === 'temperature' && value && typeof value === 'object') {
    componentType = 'temperature'
  } else if (
    (key === 'content' ||
      (key === 'description' &&
        currentItem &&
        (currentItem as ExtendedFolder).dtype === 'reaction')) &&
    isTextObject
  ) {
    componentType = 'richtext'
  } else if (specialFieldTypes[key]) {
    componentType = specialFieldTypes[key]
  }

  switch (componentType) {
    case 'quantity':
      return renderQuantityField(
        key,
        value,
        metadata,
        readonly,
        handleInputChange,
        handleSelectChange,
      )

    case 'stereo':
      return renderStereoField(key, value, readonly, handleSelectChange)

    case 'solvent':
      return renderSolventField(
        key,
        value,
        readonly,
        updateMetadata,
        currentItem,
        tree,
      )

    case 'temperature':
      return renderTemperatureField(
        key,
        value,
        metadata,
        readonly,
        updateMetadata,
      )

    case 'status':
      return renderStatusField(
        key,
        value,
        metadata,
        readonly,
        handleSelectChange,
      )

    case 'role':
      return renderRoleField(key, value, readonly, handleSelectChange)

    case 'tlc_solvents':
      return renderTlcSolventsField(key, value, readonly, updateMetadata)

    case 'kind':
      return renderKindField(key, value, readonly, updateMetadata)

    case 'rxno':
      return renderRxnoField(key, value, readonly, updateMetadata)

    case 'molfile':
      return renderMolfileField(
        key,
        value,
        readonly,
        updateMetadata,
        onMolValidationChange,
      )

    case 'cano_smiles':
      return renderSmilesField(
        key,
        value,
        readonly,
        handleInputChange,
        onMolValidationChange,
      )

    case 'richtext':
      return renderContentField(key, value, readonly, updateMetadata)

    case 'string':
      return renderStringField(key, value, readonly, handleInputChange)

    case 'number':
      return renderNumberField(key, value, readonly, handleInputChange)

    case 'boolean':
      return renderBooleanField(key, value, readonly, handleInputChange)

    case 'array':
      return renderArrayField(key, value, readonly, handleArrayChange)

    case 'null':
      return null

    default:
      return (
        <TextInputField
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
          readonly={true}
          value={`Unknown type: ${type}`}
        />
      )
  }
}

// Individual field renderers
function renderQuantityField(
  key: string,
  value: MetadataValue,
  metadata: Record<string, MetadataValue> | undefined,
  readonly: boolean,
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => void,
  handleSelectChange: (e: ChangeEvent<HTMLSelectElement>, key: string) => void,
) {
  const unitKey = getQuantityUnitKey(key)
  const unitValue = unitKey && metadata ? metadata[unitKey] : undefined

  return (
    <QuantityInputField
      key={key}
      valueKey={key}
      unitKey={unitKey || key + '_unit'}
      value={value as number}
      unit={unitValue as string}
      readonly={readonly}
      onValueChange={handleInputChange}
      onUnitChange={handleSelectChange}
      metadata={metadata}
    />
  )
}

function renderStereoField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  handleSelectChange: (e: ChangeEvent<HTMLSelectElement>, key: string) => void,
) {
  const stereoValue = value as { abs?: string; rel?: string }

  return (
    <div key={key} className="flex flex-col gap-4">
      <StereoSelectField
        type="abs"
        value={stereoValue.abs || ''}
        onChange={(e) => {
          const newStereoValue = { ...stereoValue, abs: e.target.value }
          handleSelectChange(
            { target: { value: JSON.stringify(newStereoValue) } } as any,
            key,
          )
        }}
        readonly={readonly}
      />
      <StereoSelectField
        type="rel"
        value={stereoValue.rel || ''}
        onChange={(e) => {
          const newStereoValue = { ...stereoValue, rel: e.target.value }
          handleSelectChange(
            { target: { value: JSON.stringify(newStereoValue) } } as any,
            key,
          )
        }}
        readonly={readonly}
      />
    </div>
  )
}

function renderSolventField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>,
  currentItem: ExtendedFile | ExtendedFolder | null | undefined,
  tree: Record<string, FileNode> | undefined,
) {
  const solventValues = Array.isArray(value) ? (value as SolventItem[]) : []
  const reactionFolder =
    currentItem && (currentItem as ExtendedFolder).dtype === 'reaction'
      ? (currentItem as ExtendedFolder)
      : undefined

  return (
    <SolventInputField
      key={key}
      name={key}
      onChange={(newValue) => updateMetadata(key, newValue)}
      readonly={readonly}
      values={solventValues}
      reactionFolder={reactionFolder}
      tree={tree}
    />
  )
}

function renderTemperatureField(
  key: string,
  value: MetadataValue,
  metadata: Record<string, MetadataValue> | undefined,
  readonly: boolean,
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>,
) {
  const tempObj = value as {
    data: any[]
    userText: string | null
    valueUnit: string | null
  }

  return (
    <QuantityInputField
      key={key}
      valueKey={key}
      unitKey={`${key}_unit`}
      value={tempObj.userText ? parseFloat(tempObj.userText) : undefined}
      unit={tempObj.valueUnit || undefined}
      readonly={readonly}
      onValueChange={(e) =>
        updateMetadata(key, {
          ...tempObj,
          userText: e.target.value || null,
          valueUnit: e.target.value ? tempObj.valueUnit || '°C' : null,
        })
      }
      onUnitChange={(e) =>
        updateMetadata(key, { ...tempObj, valueUnit: e.target.value })
      }
      metadata={metadata}
    />
  )
}

function renderStatusField(
  key: string,
  value: MetadataValue,
  metadata: Record<string, MetadataValue> | undefined,
  readonly: boolean,
  handleSelectChange: (e: ChangeEvent<HTMLSelectElement>, key: string) => void,
) {
  const isAnalysisStatus = metadata?.container_type === 'analysis'
  const options = isAnalysisStatus ? analysisStatusOptions : statusOptions

  return (
    <SelectField
      key={key}
      name={key}
      onChange={(e) => handleSelectChange(e, key)}
      options={options}
      placeholder="Select status..."
      readonly={readonly}
      value={(value as string) || ''}
    />
  )
}

function renderRoleField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  handleSelectChange: (e: ChangeEvent<HTMLSelectElement>, key: string) => void,
) {
  return (
    <SelectField
      key={key}
      name={key}
      onChange={(e) => handleSelectChange(e, key)}
      options={roleOptions}
      placeholder="Select role..."
      readonly={readonly}
      value={(value as string) || ''}
    />
  )
}

function renderTlcSolventsField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>,
) {
  return (
    <AutoCompleteField
      key={key}
      name={key}
      onChange={(selectedValue) => updateMetadata(key, selectedValue)}
      options={tlcSolventsOptions}
      placeholder="Select or type TLC solvent..."
      readonly={readonly}
      value={(value as string) || ''}
    />
  )
}

function renderKindField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>,
) {
  return (
    <OntologyTreeSelect
      key={key}
      value={(value as string) || ''}
      onChange={(selectedValue) => updateMetadata(key, selectedValue)}
      ontologyType="analysis"
      placeholder="Select analysis ontology type..."
      readonly={readonly}
      name="kind"
    />
  )
}

function renderRxnoField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>,
) {
  return (
    <OntologyTreeSelect
      key={key}
      value={(value as string) || ''}
      onChange={(selectedValue) => updateMetadata(key, selectedValue)}
      ontologyType="reaction"
      placeholder="Select reaction ontology type..."
      readonly={readonly}
      name="rxno"
    />
  )
}

function renderMolfileField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>,
  onMolValidationChange?: (isValid: boolean) => void,
) {
  return (
    <FileUploadInputField
      key={key}
      name={key}
      onChange={(content) => updateMetadata(key, content)}
      readonly={readonly}
      value={value as string}
      acceptedTypes=".mol,.txt"
      maxFileSize={1024 * 1024}
      onValidationChange={onMolValidationChange}
    />
  )
}

function renderSmilesField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => void,
  onMolValidationChange?: (isValid: boolean) => void,
) {
  return (
    <SmilesInputField
      key={key}
      name={key}
      onChange={(e) => handleInputChange(e, key)}
      readonly={readonly}
      value={(value as string) || ''}
      onValidationChange={onMolValidationChange}
    />
  )
}

function renderStringField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => void,
) {
  if (key.endsWith('_at') || key.startsWith('timestamp_')) {
    return (
      <DateInputField
        key={key}
        name={key}
        onChange={(e) => handleInputChange(e, key)}
        raw={false}
        readonly={readonly}
        value={(value as string) || ''}
      />
    )
  } else if (isTextArea(key)) {
    return (
      <TextAreaInputField
        key={key}
        name={key}
        onChange={(e) => handleInputChange(e, key)}
        readonly={readonly}
        value={(value as string) || ''}
      />
    )
  } else {
    return (
      <TextInputField
        key={key}
        name={key}
        onChange={(e) => handleInputChange(e, key)}
        readonly={readonly}
        value={(value as string) || ''}
      />
    )
  }
}

function renderNumberField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => void,
) {
  const isPurity = key === 'purity'
  const isDensity = key === 'density'

  return (
    <NumberInputField
      key={key}
      max={isPurity ? 1 : undefined}
      min={isPurity || isDensity ? 0 : undefined}
      name={key}
      onChange={(e) => handleInputChange(e, key)}
      readonly={readonly}
      step={isPurity || isDensity ? 0.1 : undefined}
      value={value as number}
    />
  )
}

function renderBooleanField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => void,
) {
  return (
    <CheckboxField
      checked={(value as boolean) || false}
      disabled={readonly}
      key={key}
      name={key}
      onChange={(e) => handleInputChange(e, key)}
    />
  )
}

function renderArrayField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  handleArrayChange: (newValues: string[], key: string) => Promise<void>,
) {
  return (
    <ArrayInputField
      key={key}
      name={key}
      onChange={(newValues) => handleArrayChange(newValues, key)}
      readonly={readonly}
      values={(value as string[]) || []}
    />
  )
}

function renderContentField(
  key: string,
  value: MetadataValue,
  readonly: boolean,
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>,
) {
  // Parse value if it's a JSON string, otherwise use as-is
  let deltaValue: any

  if (typeof value === 'string') {
    try {
      // Try to parse as JSON
      deltaValue = JSON.parse(value)
    } catch {
      // If parsing fails, wrap it as a Delta object
      deltaValue = { ops: [{ insert: value || '\n' }] }
    }
  } else if (value && typeof value === 'object' && 'ops' in value) {
    // Already a Delta object
    deltaValue = value
  } else {
    // Default empty content
    deltaValue = { ops: [{ insert: '\n' }] }
  }

  return (
    <ReactQuill
      key={key}
      value={deltaValue}
      readOnly={readonly}
      theme="snow"
      onChange={(_html, _delta, source, editor) => {
        if (source === 'user') {
          updateMetadata(key, editor.getContents() as any)
        }
      }}
    />
  )
}
