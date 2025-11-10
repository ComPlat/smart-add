import {
  ExtendedFile,
  ExtendedFolder,
  MetadataValue,
  filesDB,
} from '@/database/db'
import { retrieveTree } from '@/helper/retrieveTree'
import { FileNode } from '@/helper/types'
import { isExtendedMetadataField, isHidden } from '@/helper/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'

import ReactionSchemeDropDownMenu from './input-components/ReactionSchemeDropDownMenu'
import { determineSchema } from './zip-download/zodSchemes'
import { determineInputComponent } from './mappers/inputComponentMapper'
import { useMetadataHandlers } from './hooks/useMetadataHandlers'
import { useMolValidation } from './hooks/useMolValidation'

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

  const { isMolValid, setIsMolValid } = useMolValidation({ item, database })
  const {
    handleInputChange,
    handleSelectChange,
    handleArrayChange,
    updateMetadata,
  } = useMetadataHandlers({ item, tree, setItem })

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
          className={`right-0 top-0 ml-2 w-1/2 flex-col bg-white ${
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
                    .forEach(([key, value]) => {
                      flattenedEntries.push([key, value])
                    })

                  // Add extended_metadata fields if they exist
                  if (
                    metadata.extended_metadata &&
                    typeof metadata.extended_metadata === 'object'
                  ) {
                    const containerType = metadata.container_type

                    Object.entries(metadata.extended_metadata)
                      .filter(([key]) => {
                        if (isHidden(key, schemaName)) return false
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
                    determineInputComponent({
                      key,
                      value,
                      handleInputChange,
                      handleSelectChange,
                      handleArrayChange,
                      updateMetadata,
                      schema: item.metadata
                        ? determineSchema(item.metadata)
                        : undefined,
                      metadata: item.metadata,
                      isMolValid,
                      onMolValidationChange: setIsMolValid,
                      currentItem: item,
                      tree,
                    }),
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
