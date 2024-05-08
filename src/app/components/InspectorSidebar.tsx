import {
  ExtendedFile,
  ExtendedFolder,
  Metadata,
  MetadataValue,
  filesDB,
} from '@/database/db'
import { retrieveTree } from '@/helper/retrieveTree'
import { FileNode } from '@/helper/types'
import { identifyType, isReadonly } from '@/helper/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChangeEvent, useEffect, useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'
import { ZodObject, ZodRawShape } from 'zod'

import renameFolder from './context-menu/renameFolder'
import ArrayInputField from './input-components/ArrayInputField'
import CheckboxField from './input-components/CheckboxField'
import DateInputField from './input-components/DateInputField'
import DropDownMenu from './input-components/DropDownMenu'
import NumberInputField from './input-components/NumberInputField'
import TextInputField from './input-components/TextInputField'
import { datetimeSchema, determineSchema } from './zip-download/zodSchemes'

function determineInputComponent<T extends ZodRawShape>(
  key: string,
  value: MetadataValue,
  handleInputChange: (e: ChangeEvent<HTMLInputElement>, key: string) => void,
  handleArrayChange: (newValues: string[], key: string) => Promise<void>,
  schema?: ZodObject<T>,
) {
  if (!schema) return

  const [type] = identifyType(schema, key)
  const readonly = isReadonly(key)

  switch (type) {
    case 'string':
      if (datetimeSchema.safeParse(value).success) {
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
        return Number(target.value)
      default:
        return target.value
    }
  }

  const updateMetadata = async (
    key: string,
    newValue: boolean | number | string | string[] | undefined,
  ) => {
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
          if (item.name !== updatedName) handleClose()

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
    e: ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const target = e.target
    let newValue = extractValue(target)

    if (typeof newValue === 'string') {
      const parsedDate = new Date(newValue)
      if (!isNaN(parsedDate.getTime())) newValue += 'Z'
    }

    await updateMetadata(key, newValue)
  }

  const handleArrayChange = async (newValues: string[], key: string) => {
    await updateMetadata(key, newValues)
  }

  const getItemName = (item: ExtendedFile | ExtendedFolder) =>
    (item as ExtendedFile).file?.name ?? item.name ?? ''

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
            <p className="font-bold">{getItemName(item)}</p>
            {(item as ExtendedFolder).dtype === 'sample' && item.parentUid && (
              <>
                <p>{JSON.stringify(item, null, 2)}</p>
                <DropDownMenu />
              </>
            )}
            <div className="flex flex-col gap-4">
              {item.metadata &&
                Object.entries(item.metadata).map(([key, value]) =>
                  determineInputComponent(
                    key,
                    value,
                    handleInputChange,
                    handleArrayChange,
                    item.metadata ? determineSchema(item.metadata) : undefined,
                  ),
                )}
            </div>
          </div>
        </aside>
      )}
    </>
  )
}

export default InspectorSidebar
