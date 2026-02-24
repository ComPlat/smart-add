import { useState } from 'react'

import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'

import renameFile from '@/app/components/context-menu/renameFile'
import renameFolder from '@/app/components/context-menu/renameFolder'

export function useRename(
  item: ExtendedFile | ExtendedFolder,
  tree: Record<string, FileNode>,
  onDone: () => void,
) {
  const [newName, setNewName] = useState(item.name)
  const [isValid, setIsValid] = useState(false)

  const validate = (userInput: string) => {
    setNewName(userInput)
    const parentPath =
      item.fullPath.split('/').slice(0, -1).join('/') || item.treeId

    const validInput = userInput.trim().length > 0 && !userInput.includes('/')

    const newPath =
      parentPath === item.treeId ? userInput : parentPath + '/' + userInput

    const parentNode = tree[parentPath]
    const nameAvailable = parentNode
      ? !parentNode.children.includes(newPath)
      : true

    setIsValid(validInput && nameAvailable)
  }

  const reset = () => {
    setNewName(item.name)
    setIsValid(false)
  }

  const executeRename = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    const treeNode = tree[item.fullPath]
    if (treeNode) treeNode.data = newName

    if (!item.isFolder) renameFile(item as ExtendedFile, newName)
    else renameFolder(item as ExtendedFolder, tree, newName)

    onDone()
  }

  return { newName, isValid, validate, reset, executeRename }
}
