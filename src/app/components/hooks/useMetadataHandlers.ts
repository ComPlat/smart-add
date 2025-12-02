import {
  ExtendedFile,
  ExtendedFolder,
  Metadata,
  MetadataValue,
  filesDB,
} from '@/database/db'
import { FileNode } from '@/helper/types'
import { isExtendedMetadataField } from '@/helper/utils'
import { ChangeEvent } from 'react'
import renameFolder from '../context-menu/renameFolder'

interface UseMetadataHandlersProps {
  item: ExtendedFile | ExtendedFolder | null
  tree: Record<string, FileNode>
  setItem: React.Dispatch<
    React.SetStateAction<ExtendedFile | ExtendedFolder | null>
  >
}

export const useMetadataHandlers = ({
  item,
  tree,
  setItem,
}: UseMetadataHandlersProps) => {
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

  const updateMetadata = async (
    key: string,
    newValue: MetadataValue,
    targetFullPath?: string,
  ) => {
    if (!item || !item.fullPath) return

    // Use the provided targetFullPath or fall back to current item's fullPath
    const fullPath = targetFullPath || item.fullPath

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

    // Extract itemId from dataset if provided
    const targetPath = (target as any).dataset?.itemId

    // Only add 'Z' for actual datetime fields (fields ending with '_at')
    if (typeof newValue === 'string' && key.endsWith('_at')) {
      const parsedDate = new Date(newValue)
      if (!isNaN(parsedDate.getTime())) newValue += 'Z'
    }

    // Update the field value with optional targetPath
    await updateMetadata(key, newValue, targetPath)

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

  return {
    handleInputChange,
    handleSelectChange,
    handleArrayChange,
    updateMetadata,
  }
}
