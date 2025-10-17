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
  isExtendedMetadataField,
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
import AutoCompleteField from './input-components/AutoCompleteField'
import CheckboxField from './input-components/CheckboxField'
import DateInputField from './input-components/DateInputField'
import FileUploadInputField from './input-components/FileUploadInputField'
import NumberInputField from './input-components/NumberInputField'
import ReactionSchemeDropDownMenu from './input-components/ReactionSchemeDropDownMenu'
import QuantityInputField from './input-components/QuantityInputField'
import SolventInputField, {
  SolventItem,
} from './input-components/SolventInputField'
import StereoSelectField from './input-components/StereoSelectField'
import TextAreaInputField from './input-components/TextAreaInputField'
import TextInputField from './input-components/TextInputField'
import SelectField from './input-components/SelectField'
import OntologyTreeSelect from './input-components/OntologyTreeSelect'
import { determineSchema } from './zip-download/zodSchemes'
import {
  tlcSolventsOptions,
  statusOptions,
  analysisStatusOptions,
  roleOptions,
} from './input-components/selectOptions'

// MOL file validation function (copied from FileUploadInputField for consistency)
const validateMolFile = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false

  const lines = content.split('\n')

  // Check minimum lines (header block + counts line)
  if (lines.length < 4) return false

  // Check for M  END terminator
  const hasEndTerminator = lines.some((line) =>
    line.trim().startsWith('M  END'),
  )

  return hasEndTerminator
}

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
  isMolValid?: boolean,
  onMolValidationChange?: (isValid: boolean) => void,
  currentItem?: ExtendedFile | ExtendedFolder | null,
  tree?: Record<string, FileNode>,
) {
  if (!schema) return

  const [type] = identifyType(schema, key)
  // Special logic for decoupled field - make it editable when MOL file is valid
  const readonly = key === 'decoupled' ? !isMolValid : isReadonly(key)

  // Skip unit fields as they're handled by QuantityInputField
  if (isQuantityUnit(key)) {
    return null
  }

  // Map special field keys to their component types
  const specialFieldTypes: Record<string, string> = {
    solvent: 'solvent',
    tlc_solvents: 'tlc_solvents',
    status: 'status',
    role: 'role',
    instrument: 'string',
    kind: 'kind',
    rxno: 'rxno',
    molfile: 'molfile',
  }

  // Determine component type
  let componentType: string = type
  if (isQuantityValue(key)) {
    componentType = 'quantity'
  } else if (key === 'stereo' && value && typeof value === 'object') {
    componentType = 'stereo'
  } else if (key === 'temperature' && value && typeof value === 'object') {
    componentType = 'temperature'
  } else if (specialFieldTypes[key]) {
    componentType = specialFieldTypes[key]
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
      // Only pass reactionFolder if currentItem is a reaction
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
    case 'temperature': {
      // Temperature is stored as an object: {data: [], userText: "123", valueUnit: "°C"}
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
              // Set unit to existing or default to °C when value is entered
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
    case 'status': {
      // Use analysis-specific options if this is an extended_metadata field for analysis containers
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
    case 'kind': {
      return (
        <OntologyTreeSelect
          key={key}
          value={(value as string) || ''}
          onChange={(selectedValue) => updateMetadata(key, selectedValue)}
          ontologyType={'analysis'}
          placeholder={`Select analysis ontology type...`}
          readonly={readonly}
          name="kind"
        />
      )
    }
    case 'rxno': {
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
    case 'molfile': {
      return (
        <FileUploadInputField
          key={key}
          name={key}
          onChange={(content) => updateMetadata(key, content)}
          readonly={readonly}
          value={value as string}
          acceptedTypes=".mol,.txt"
          maxFileSize={1024 * 1024} // 1MB
          onValidationChange={onMolValidationChange}
        />
      )
    }
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
  const [isMolValid, setIsMolValid] = useState(false)
  const [prevMolValid, setPrevMolValid] = useState(false)

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

  // Check if existing MOL content is valid when item changes
  useEffect(() => {
    const checkMolFileValidity = async () => {
      // First check if the current item has a molfile
      if (
        item?.metadata?.molfile &&
        typeof item.metadata.molfile === 'string'
      ) {
        const isValid = validateMolFile(item.metadata.molfile)
        setIsMolValid(isValid)
        return
      }
      // If current item doesn't have molfile, check if it's a sample with a molecule child
      if (item?.fullPath && database?.folders) {
        // Look for a child molecule container
        const moleculeChild = database.folders.find(
          (folder) =>
            folder.fullPath?.startsWith(item.fullPath + '/') &&
            folder.dtype === 'molecule',
        )
        if (
          moleculeChild?.metadata?.molfile &&
          typeof moleculeChild.metadata.molfile === 'string'
        ) {
          const isValid = validateMolFile(moleculeChild.metadata.molfile)
          setIsMolValid(isValid)

          // If molfile just became valid (wasn't valid before), set decoupled to false
          if (
            isValid &&
            !prevMolValid &&
            (item as ExtendedFolder).dtype === 'sample'
          ) {
            setPrevMolValid(true)
            await filesDB.folders
              .where({ fullPath: item.fullPath })
              .modify((folder) => {
                folder.metadata = {
                  ...folder.metadata,
                  decoupled: false,
                } as Metadata
              })
          } else if (isValid) {
            setPrevMolValid(true)
          }
          return
        }
      }
      // No valid molfile found - set decoupled to true if it's a sample
      setIsMolValid(false)
      setPrevMolValid(false)
      if (
        item?.fullPath &&
        (item as ExtendedFolder).dtype === 'sample' &&
        item.metadata?.decoupled !== true
      ) {
        await filesDB.folders
          .where({ fullPath: item.fullPath })
          .modify((folder) => {
            folder.metadata = {
              ...folder.metadata,
              decoupled: true,
            } as Metadata
          })
      }
    }

    checkMolFileValidity()
  }, [item, database])

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

          let updatedMetadata = { ...dbItem.metadata }

          // Check if this is an extended_metadata field
          const containerType = String(updatedMetadata.container_type || '')

          if (isExtendedMetadataField(containerType, key)) {
            // Update within extended_metadata
            const currentExtendedMetadata =
              (updatedMetadata.extended_metadata as Record<string, any>) || {}
            updatedMetadata = {
              ...updatedMetadata,
              extended_metadata: {
                ...currentExtendedMetadata,
                [key]: newValue,
              } as any,
            }
          } else {
            // Regular top-level field
            updatedMetadata = { ...updatedMetadata, [key]: newValue } as any
          }

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

    // Only add 'Z' for actual datetime fields (fields ending with '_at')
    if (typeof newValue === 'string' && key.endsWith('_at')) {
      const parsedDate = new Date(newValue)
      if (!isNaN(parsedDate.getTime())) newValue += 'Z'
    }

    // Update the field value
    await updateMetadata(key, newValue)

    // ONLY apply interlinking for density/molarity fields (no extra work for description, etc.)
    if (key === 'density' && newValue !== null) {
      await updateMetadata('molarity_value', null)
    } else if (key === 'molarity_value' && newValue !== null) {
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
    if (key === 'density' && newValue !== null) {
      await updateMetadata('molarity_value', null)
    } else if (key === 'molarity_value' && newValue !== null) {
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

  const getImage = (item: ExtendedFile | ExtendedFolder) => {
    const file = (item as ExtendedFile).file
    const extension = (item as ExtendedFile).extension?.toLowerCase()
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg']

    // Check if it's a file and has an image MIME type or image extension
    const isImage =
      file &&
      ((file.type && file.type.startsWith('image/')) ||
        (extension && imageExtensions.includes(extension)))

    if (isImage) {
      const imageUrl = URL.createObjectURL(file as Blob)
      const altText = 'name' in file ? (file as any).name : item.name
      return (
        <div className="mt-0">
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full h-auto rounded border"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )
    }

    return null
  }

  return (
    <>
      {isOpen && item && (
        <aside
          className={`right-0 top-0 ml-2 w-1/3 flex-col rounded-tl-xl bg-white ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } z-40 max-h-screen overflow-y-auto p-4 duration-300 ease-in-out`}
        >
          <div className="flex flex-col gap-4">
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
            {getImage(item)}
            {(item as ExtendedFolder).dtype === 'sample' && item.parentUid && (
              <ReactionSchemeDropDownMenu item={item as ExtendedFolder} />
            )}
            <div className="flex flex-col gap-4">
              {item.metadata &&
                (() => {
                  const metadata = item.metadata
                  const flattenedEntries: [string, MetadataValue][] = []
                  // Determine schema type based on container_type or item type
                  const schemaName = String(
                    metadata.container_type ||
                      (item as ExtendedFolder).dtype ||
                      '',
                  )
                  // Add all top-level metadata except extended_metadata
                  Object.entries(metadata)
                    .filter(
                      ([key]) =>
                        key !== 'extended_metadata' &&
                        !isHidden(key, schemaName),
                    )
                    .forEach(([key, value]) =>
                      flattenedEntries.push([key, value]),
                    )
                  // Add extended_metadata fields if they exist
                  if (
                    metadata.extended_metadata &&
                    typeof metadata.extended_metadata === 'object'
                  ) {
                    const containerType = metadata.container_type

                    Object.entries(metadata.extended_metadata)
                      .filter(([key]) => {
                        if (isHidden(key, schemaName)) return false

                        // Only show container-type specific fields
                        return isExtendedMetadataField(
                          String(containerType || ''),
                          key,
                        )
                      })
                      .forEach(([key, value]) =>
                        flattenedEntries.push([key, value]),
                      )
                  }

                  return flattenedEntries
                })()
                  .sort(([keyA], [keyB]) => {
                    const topFields = [
                      'name',
                      'decoupled',
                      'instrument',
                      'cano_smiles',
                      'molfile',
                      'status',
                      'rxno',
                      'solvent',
                      'external_label',
                      'density',
                      'molarity_value',
                      'purity',
                      'target_amount_value',
                      'real_amount_value',
                      'kind',
                      'description',
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
                      isMolValid,
                      setIsMolValid,
                      item,
                      tree,
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
