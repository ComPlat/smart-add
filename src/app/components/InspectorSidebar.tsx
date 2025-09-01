import {
  ExtendedFile,
  ExtendedFolder,
  Metadata,
  MetadataValue,
  filesDB,
} from '@/database/db'
import { retrieveTree } from '@/helper/retrieveTree'
import { FileNode } from '@/helper/types'
import {
  identifyType,
  isHidden,
  isReadonly,
  isTextArea,
  isQuantityValue,
  isQuantityUnit,
  getQuantityUnitKey,
} from '@/helper/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChangeEvent, useEffect, useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'
import { ZodObject, ZodRawShape } from 'zod'

import renameFolder from './context-menu/renameFolder'
import ArrayInputField from './input-components/ArrayInputField'
import CheckboxField from './input-components/CheckboxField'
import DateInputField from './input-components/DateInputField'
import NumberInputField from './input-components/NumberInputField'
import ReactionSchemeDropDownMenu from './input-components/ReactionSchemeDropDownMenu'
import QuantityInputField from './input-components/QuantityInputField'
import SolventInputField, {
  SolventItem,
} from './input-components/SolventInputField'
import StereoSelectField from './input-components/StereoSelectField'
import TextAreaInputField from './input-components/TextAreaInputField'
import TextInputField from './input-components/TextInputField'
import SelectField, { SelectOption } from './input-components/SelectField'
import { determineSchema } from './zip-download/zodSchemes'

const tlcSolventsOptions: SelectOption[] = [
  {
    value: 'cyclohexane/ethyl acetate 20:1',
    label: 'cyclohexane/ethyl acetate 20:1',
  },
  { value: 'CH₂Cl₂/MeOH 20:1', label: 'CH₂Cl₂/MeOH 20:1' },
  {
    value: 'cyclohexane/ethyl acetate 20:1 + 1% NEt₃',
    label: 'cyclohexane/ethyl acetate 20:1 + 1% NEt₃',
  },
]

const statusOptions: SelectOption[] = [
  { value: 'Planned', label: 'Planned' },
  { value: 'Running', label: 'Running' },
  { value: 'Done', label: 'Done' },
  { value: 'Successful', label: 'Successful' },
  { value: 'Not Successful', label: 'Not Successful' },
  { value: 'Analyses Pending', label: 'Analyses Pending' },
]

const roleOptions: SelectOption[] = [
  { value: 'gp', label: 'General Procedure (gp)' },
  { value: 'parts', label: 'Parts' },
  { value: 'single', label: 'Single' },
  { value: 'parallel', label: 'Parallel' },
  { value: 'screening', label: 'Screening' },
]

function determineInputComponent<T extends ZodRawShape>(
  key: string,
  value: MetadataValue,
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => void,
  handleSelectChange: (e: ChangeEvent<HTMLSelectElement>, key: string) => void,
  handleArrayChange: (newValues: string[], key: string) => Promise<void>,
  updateMetadata: (key: string, newValue: MetadataValue) => Promise<void>,
  schema?: ZodObject<T>,
  metadata?: Record<string, MetadataValue>,
) {
  if (!schema) return

  const [type] = identifyType(schema, key)
  const readonly = isReadonly(key)

  // Skip unit fields as they're handled by QuantityInputField
  if (isQuantityUnit(key)) {
    return null
  }

  // Determine special case types before the switch
  let componentType: string = type
  if (isQuantityValue(key)) {
    componentType = 'quantity'
  } else if (key === 'stereo' && value && typeof value === 'object') {
    componentType = 'stereo'
  } else if (key === 'solvent') {
    componentType = 'solvent'
  } else if (key === 'tlc_solvents') {
    componentType = 'tlc_solvents'
  } else if (key === 'status') {
    componentType = 'status'
  } else if (key === 'role') {
    componentType = 'role'
  }

  switch (componentType) {
    case 'quantity': {
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
    case 'stereo': {
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
    case 'solvent': {
       // Always use SolventInputField for complex solvent arrays
      const solventValues = Array.isArray(value) ? (value as SolventItem[]) : []
      return (
        <SolventInputField
          key={key}
          name={key}
          onChange={(newValue) => updateMetadata(key, newValue)}
          readonly={readonly}
          values={solventValues}
        />
      )
    }
    case 'status': {
      return (
        <SelectField
          key={key}
          name={key}
          onChange={(e) => handleSelectChange(e, key)}
          options={statusOptions}
          placeholder="Select status..."
          readonly={readonly}
          value={(value as string) || ''}
        />
      )
    }
    case 'role': {
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
    case 'tlc_solvents': {
      return (
        <SelectField
          key={key}
          name={key}
          onChange={(e) => handleSelectChange(e, key)}
          options={tlcSolventsOptions}
          placeholder="Select TLC solvent..."
          readonly={readonly}
          value={(value as string) || ''}
        />
      )
    }
    case 'string':
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
    case 'number': {
      // Special handling for purity field
      const isOnlyPositive = key === 'purity' || key === 'density'

      return (
        <NumberInputField
          key={key}
          max={isOnlyPositive ? 1 : undefined}
          min={isOnlyPositive ? 0 : undefined}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
          readonly={readonly}
          step={isOnlyPositive ? 0.1 : undefined}
          value={value as number}
        />
      )
    }
    case 'boolean':
      return (
        <CheckboxField
          checked={(value as boolean) || false}
          disabled={readonly}
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
        />
      )
    // TODO: Implement enum and object input components
    //        temperature, and text objects
    case 'enum':
      return (
        <TextInputField
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
          readonly={true}
          value={'TODO: Enum/Select'}
        />
      )
    case 'object':
      return (
        <TextInputField
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
          readonly={true}
          value={'TODO: Object'}
        />
      )
    case 'array':
      return (
        <ArrayInputField
          key={key}
          name={key}
          onChange={(newValues) => handleArrayChange(newValues, key)}
          readonly={readonly}
          values={(value as string[]) || []}
        />
      )
    case 'null':
      return
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

const InspectorSidebar = ({
  focusedItem,
  setFocusedItem,
}: {
  focusedItem: TreeItemIndex | undefined
  setFocusedItem: (item: TreeItemIndex | undefined) => void
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const [item, setItem] = useState<ExtendedFile | ExtendedFolder | null>(null)
  const [tree, setTree] = useState({} as Record<string, FileNode>)

  const database = useLiveQuery(async () => {
    const files = await filesDB.files.toArray()
    const folders = await filesDB.folders.toArray()

    const [inputTreeRoot, assignmentTreeRoot] = [
      'inputTreeRoot',
      'assignmentTreeRoot',
    ]
    const retrievedInputTree = retrieveTree(files, folders, inputTreeRoot)
    const retrievedAssignmentTree = retrieveTree(
      files,
      folders,
      assignmentTreeRoot,
    )
    setTree({ ...retrievedInputTree, ...retrievedAssignmentTree })

    return { files, folders }
  })

  useEffect(() => {
    if (focusedItem) {
      const items = [
        ...(database?.files || []),
        ...(database?.folders || []),
      ].filter((item) => item.fullPath === focusedItem)

      if (items.length > 0) {
        setItem(items[0])
        setIsOpen(true)
      }
    } else {
      setItem(null)
    }
  }, [database?.files, database?.folders, focusedItem])

  const handleClose = () => {
    setIsOpen(false)
    setFocusedItem(undefined)
  }

  const extractValue = (
    target: EventTarget & (HTMLInputElement | HTMLTextAreaElement),
  ): boolean | number | string | undefined => {
    if ('type' in target) {
      const inputTarget = target as HTMLInputElement
      switch (inputTarget.type) {
        case 'checkbox':
          return inputTarget.checked
        case 'number':
          return Number(inputTarget.value)
        default:
          return inputTarget.value
      }
    }
    return (target as HTMLTextAreaElement).value
  }

  const updateMetadata = async (key: string, newValue: MetadataValue) => {
    if (!item || !item.fullPath) return

    const fullPath = item.fullPath
    try {
      await filesDB.transaction(
        'rw',
        [filesDB.files, filesDB.folders],
        async () => {
          const dbItem = await filesDB.folders.get({ fullPath })
          if (!dbItem) return

          let updatedMetadata = { ...dbItem.metadata, [key]: newValue }
          let updatedName = item.name
          if (key === 'name') {
            updatedName = newValue as string
          }

          updatedMetadata = Object.entries(updatedMetadata).reduce(
            (acc, [key, value]) => {
              if (value !== undefined) acc[key] = value
              return acc
            },
            {} as Metadata,
          )

          await filesDB.folders.where({ fullPath }).modify((folder) => {
            folder.metadata = updatedMetadata as Metadata
            folder.name = updatedName
          })

          renameFolder(item as ExtendedFolder, tree, updatedName)

          setItem(
            (prevItem) =>
              ({
                ...prevItem,
                metadata: updatedMetadata,
                name: updatedName,
              }) as ExtendedFile | ExtendedFolder,
          )
        },
      )
    } catch (error) {
      console.error('Failed to update item in Dexie DB', error)
    }
  }

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => {
    const target = e.target
    let newValue = extractValue(target)

     // Handle datetime fields - ensure proper ISO format
    if (
      typeof newValue === 'string' &&
      (key.endsWith('_at') || key.startsWith('timestamp_'))
    ) {
      // If it's already ISO format or the DateInputField has converted it, don't modify
      if (
        newValue.includes('T') &&
        (newValue.endsWith('Z') ||
          newValue.includes('+') ||
          newValue.includes('-'))
      ) {
        // Already in ISO format, keep as is
      } else {
        // Try to parse as date and convert to ISO if valid
        const parsedDate = new Date(newValue)
        if (!isNaN(parsedDate.getTime())) {
          newValue = parsedDate.toISOString()
        }
      }
    }
    console.log('New Value:', newValue, 'for key:', key)

    // Update the field value
    await updateMetadata(key, newValue)

    // ONLY apply interlinking for density/molarity fields (no extra work for description, etc.)
    if (key === 'density' && newValue !== null && newValue !== 0) {
      await updateMetadata('molarity_value', null)
    } else if (
      key === 'molarity_value' &&
      newValue !== null &&
      newValue !== 0
    ) {
      await updateMetadata('density', null)
    }
  }

  const handleSelectChange = async (
    e: ChangeEvent<HTMLSelectElement>,
    key: string,
  ) => {
    let newValue: MetadataValue = e.target.value
    // Handle stereo object updates
    if (key === 'stereo' && typeof newValue === 'string') {
      try {
        newValue = JSON.parse(newValue) as MetadataValue
      } catch (error) {
        console.error('Failed to parse stereo value:', error)
        return
      }
    }

    // Update the field value
    await updateMetadata(key, newValue)

    // ONLY apply interlinking for density/molarity fields (no extra work for description, etc.)
    if (key === 'density' && newValue !== null && newValue !== 0) {
      await updateMetadata('molarity_value', null)
    } else if (
      key === 'molarity_value' &&
      newValue !== null &&
      newValue !== 0
    ) {
      await updateMetadata('density', null)
    }
  }

  const handleArrayChange = async (newValues: string[], key: string) => {
    await updateMetadata(key, newValues)
  }

  const getItemName = (item: ExtendedFile | ExtendedFolder) => {
    const file = (item as ExtendedFile).file
    if (file && 'name' in file) {
      return file.name
    }
    return item.name ?? ''
  }

  return (
    <>
      {isOpen && item && (item as ExtendedFolder).dtype !== 'analyses' && (
        <aside
          className={`right-0 top-0 ml-2 w-1/3 flex-col rounded-tl-xl bg-white ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } z-40 max-h-screen overflow-y-auto p-4 duration-300 ease-in-out`}
        >
          <div className="flex flex-col gap-8">
            <button onClick={handleClose}>
              <svg
                className="absolute right-2 top-2 h-6 w-6 cursor-pointer duration-100 hover:text-kit-primary-full"
                fill="none"
                stroke="currentColor"
                viewBox="-8 -8 40 40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  fill="transparent"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 17L17 7M7 7l10 10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
            <p className="font-bold">{getItemName(item)}</p>
            {(item as ExtendedFolder).dtype === 'sample' && item.parentUid && (
              <ReactionSchemeDropDownMenu item={item as ExtendedFolder} />
            )}
            <div className="flex flex-col gap-4">
              {item.metadata &&
                Object.entries(item.metadata)
                  .filter(([key]) => !isHidden(key))
                  .sort(([keyA], [keyB]) => {
                    const topFields = [
                      'name',
                      'description',
                      'decoupled',
                      'external_label',
                      'density',
                      'molarity_value',
                      'purity',
                      'target_amount_value',
                      'real_amount_value',
                    ]
                    const indexA = topFields.indexOf(keyA)
                    const indexB = topFields.indexOf(keyB)

                    if (indexA !== -1 && indexB !== -1) return indexA - indexB
                    if (indexA !== -1) return -1
                    if (indexB !== -1) return 1
                    return 0
                  })
                  .map(([key, value]) =>
                    determineInputComponent(
                      key,
                      value,
                      handleInputChange,
                      handleSelectChange,
                      handleArrayChange,
                      updateMetadata,
                      item.metadata
                        ? determineSchema(item.metadata)
                        : undefined,
                      item.metadata,
                    ),
                  )
                  .filter(Boolean)}
            </div>
          </div>
        </aside>
      )}
    </>
  )
}

export default InspectorSidebar
