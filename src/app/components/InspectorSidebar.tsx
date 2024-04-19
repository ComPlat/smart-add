import {
  ExtendedFile,
  ExtendedFolder,
  Metadata,
  MetadataValue,
  filesDB,
} from '@/database/db'
import { retrieveTree } from '@/helper/retrieveTree'
import { FileNode } from '@/helper/types'
import { useLiveQuery } from 'dexie-react-hooks'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'

import renameFolder from './context-menu/renameFolder'
import { datetimeSchema } from './zip-download/zodSchemes'

const formatLabel = (text: string): string =>
  text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

interface TextInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  readonly: boolean
  value?: string
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  placeholder = 'Enter text...',
  readonly = false,
  value = '',
}) => {
  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>
      <input
        className={`mt-2 rounded border px-2 py-1 outline-gray-200 focus:border-kit-primary-full 
        ${
          readonly
            ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
            : 'bg-white hover:border-kit-primary-full'
        } ${className}`}
        autoFocus={autoFocus}
        id={id}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readonly}
        type="text"
        value={value}
      />
    </label>
  )
}

interface NumberInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  readonly?: boolean
  value?: number
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  readonly = false,
  value,
}) => (
  <label className="flex flex-col text-sm">
    <p className="font-bold">{formatLabel(name)}</p>
    <input
      className={`mt-2 rounded border px-2 py-1 outline-gray-200 focus:border-kit-primary-full 
      ${
        readonly
          ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
          : 'bg-white hover:border-kit-primary-full'
      } ${className}`}
      autoFocus={autoFocus}
      id={id}
      name={name}
      onChange={onChange}
      readOnly={readonly}
      type="number"
      value={value || ''}
    />
  </label>
)

interface DateInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  raw?: boolean
  readonly?: boolean
  value?: string
}

const DateInputField: React.FC<DateInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  readonly = false,
  value = '',
}) => {
  const formattedValue = value ? value.slice(0, -1) : ''

  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel(name)}</p>
      <input
        className={`mt-2 rounded border px-2 py-1 outline-gray-200 focus:border-kit-primary-full 
        ${
          readonly
            ? 'cursor-not-allowed bg-gray-100 hover:border-inherit'
            : 'bg-white hover:border-kit-primary-full'
        } ${className}`}
        autoFocus={autoFocus}
        id={id}
        name={name}
        onChange={onChange}
        readOnly={readonly}
        type="datetime-local"
        value={formattedValue}
      />
    </label>
  )
}

interface CheckboxFieldProps {
  checked: boolean
  className?: string
  disabled?: boolean
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  checked = false,
  className = '',
  disabled = false,
  id,
  name,
  onChange,
}) => (
  <label className="flex gap-2">
    <input
      checked={checked}
      className={`rounded border px-2 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
      disabled={disabled}
      id={id}
      name={name}
      onChange={onChange}
      type="checkbox"
    />
    <p className="text-sm">{formatLabel(name)}</p>
  </label>
)

function isReadonly(key: string): boolean {
  const readonlyKeys = [
    'created_at',
    'updated_at',
    'deleted_at',
    'ancestry',
    'parent_id',
    'fingerprint_id',
    'decoupled',
    'name',
  ]
  return readonlyKeys.includes(key)
}

function determineInputComponent(
  key: string,
  value: MetadataValue,
  handleInputChange: (e: ChangeEvent<HTMLInputElement>, key: string) => void,
) {
  const readonly = isReadonly(key)
  const inputType = typeof value

  // TODO: Add support for array, temperature, and text objects
  switch (inputType) {
    case 'string':
      if (datetimeSchema.safeParse(value).success) {
        return (
          <DateInputField
            key={key}
            name={key}
            onChange={(e) => handleInputChange(e, key)}
            raw={false}
            readonly={readonly}
            value={value as string}
          />
        )
      } else {
        return (
          <TextInputField
            key={key}
            name={key}
            onChange={(e) => handleInputChange(e, key)}
            readonly={readonly}
            value={value as string}
          />
        )
      }
    case 'number':
      return (
        <NumberInputField
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
          readonly={readonly}
          value={value as number}
        />
      )
    case 'boolean':
      return (
        <CheckboxField
          checked={value as boolean}
          disabled={readonly}
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
        />
      )
    default:
      return (
        <TextInputField
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
          readonly={readonly}
          value=""
        />
      )
  }
}

const InspectorSidebar = ({
  focusedItem,
}: {
  focusedItem: TreeItemIndex | undefined
}) => {
  const [isOpen, setIsOpen] = useState(false)
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
    }
  }, [database?.files, database?.folders, focusedItem])

  const handleClose = () => {
    setIsOpen(false)
  }

  const extractValue = (
    target: EventTarget & HTMLInputElement,
  ): boolean | number | string | undefined => {
    switch (target.type) {
      case 'checkbox':
        return target.checked
      case 'number':
        return target.valueAsNumber
      default:
        return target.value
    }
  }

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const target = e.target
    let newValue = extractValue(target)

    if (typeof newValue === 'string') {
      const parsedDate = new Date(newValue)
      if (!isNaN(parsedDate.getTime())) newValue += 'Z'
    }

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

          await filesDB.folders.where({ fullPath }).modify({
            metadata: updatedMetadata,
            name: updatedName,
          })

          renameFolder(item as ExtendedFolder, tree, updatedName)
          item.name !== updatedName && handleClose()

          setItem((prevItem) => {
            if (!prevItem) return null

            return {
              ...prevItem,
              metadata: updatedMetadata,
              name: updatedName,
            } as ExtendedFile | ExtendedFolder
          })
        },
      )
    } catch (error) {
      console.error('Failed to update item in Dexie DB', error)
    }
  }

  return (
    <>
      {isOpen && item && (
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
            <p className="truncate font-bold">{item.name}</p>
            <div className="flex flex-col gap-6">
              {item.metadata &&
                Object.entries(item.metadata).map(([key, value]) =>
                  determineInputComponent(key, value, handleInputChange),
                )}
            </div>
          </div>
        </aside>
      )}
    </>
  )
}

export default InspectorSidebar
