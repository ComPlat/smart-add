import { ExtendedFile, ExtendedFolder, Metadata, filesDB } from '@/database/db'
import { retrieveTree } from '@/helper/retrieveTree'
import { FileNode } from '@/helper/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChangeEvent, useEffect, useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'

import renameFolder from './context-menu/renameFolder'

const formatLabel = (text: string): string =>
  text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

interface TextInputFieldProps {
  autoFocus?: boolean
  className?: string
  disabled?: boolean
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  value?: string
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  autoFocus = false,
  className = '',
  disabled = false,
  id,
  name,
  onChange: onSubmit,
  placeholder = 'Enter text...',
  value: initialValue,
}) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit(event as unknown as ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <label className="flex flex-col">
      {formatLabel(name)}
      {disabled ? (
        <p className="px-4 py-1">{value || 'None'}</p>
      ) : (
        <input
          autoFocus={autoFocus}
          className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
          disabled={disabled}
          id={id}
          name={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      )}
    </label>
  )
}

interface NumberInputFieldProps {
  autoFocus?: boolean
  className?: string
  disabled?: boolean
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  value?: number
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  autoFocus = false,
  className = '',
  disabled = false,
  id,
  name,
  onChange,
  value,
}) => (
  <label className="flex flex-col">
    {formatLabel(name)}
    {disabled ? (
      <p className="px-4 py-1">{value}</p>
    ) : (
      <input
        autoFocus={autoFocus}
        className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        type="number"
        value={value || ''}
      />
    )}
  </label>
)

import React from 'react'

interface DateInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  raw?: boolean
  value?: string
}

const DateInputField: React.FC<DateInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  raw = false,
  value = '',
}) => {
  const formatDateForInput = (isoString: string): string => {
    return isoString.split('T')[0]
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value
    if (!raw && newValue) {
      newValue += 'T00:00:00.000Z'
    }
    const newEvent = {
      ...event,
      target: { ...event.target, value: newValue },
    }
    onChange(newEvent)
  }

  return (
    <label className="flex flex-col">
      {name}
      <input
        autoFocus={autoFocus}
        className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
        id={id}
        name={name}
        onChange={handleInputChange}
        type={raw ? 'text' : 'date'}
        value={raw ? value : formatDateForInput(value)}
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
      className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
      disabled={disabled}
      id={id}
      name={name}
      onChange={onChange}
      type="checkbox"
    />
    {formatLabel(name)}
  </label>
)

function determineInputComponent(
  key: string,
  value: boolean | null | number | string | undefined,
  handleInputChange: (e: ChangeEvent<HTMLInputElement>, key: string) => void,
) {
  const disabled =
    key.toLowerCase().includes('id') || key.toLowerCase().includes('ancestry')
  const inputType = typeof value

  const isISODateTime = (value: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    return regex.test(value)
  }

  switch (inputType) {
    case 'string':
      if (isISODateTime(value as string)) {
        return (
          <DateInputField
            key={key}
            name={key}
            onChange={(e) => handleInputChange(e, key)}
            raw={false}
            value={value as string}
          />
        )
      } else {
        return (
          <TextInputField
            disabled={disabled}
            key={key}
            name={key}
            onChange={(e) => handleInputChange(e, key)}
            value={value as string}
          />
        )
      }
    case 'number':
      return (
        <NumberInputField
          disabled={disabled}
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
          value={value as number}
        />
      )
    case 'boolean':
      return (
        <CheckboxField
          checked={value as boolean}
          disabled={disabled}
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
        />
      )
    default:
      return (
        <TextInputField
          disabled={disabled}
          key={key}
          name={key}
          onChange={(e) => handleInputChange(e, key)}
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

  const handleInputChange = async (
    e: ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const target = e.target
    let newValue: boolean | number | string | undefined

    if (target.type === 'checkbox') {
      newValue = target.checked
    } else if (target.type === 'number') {
      newValue = target.valueAsNumber
    } else {
      newValue = target.value
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
          className={`right-0 top-0 ml-2 w-[30vw] flex-col rounded-tl-xl bg-white ${
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
            <p className="font-bold">{item.name}</p>
            <div className="flex flex-col gap-4">
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
