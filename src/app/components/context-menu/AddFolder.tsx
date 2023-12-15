import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'

import {
  createFolder,
  getUniqueFolderName,
} from '../structure-btns/folderUtils'

const AddFolder = ({
  className,
  close,
  item,
  tree,
}: {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder | undefined
  tree: Record<string, FileNode>
}) => {
  const baseFolderName = 'New Folder'

  const [newFolderName, setNewFolderName] = useState(baseFolderName)
  const [showInput, setShowInput] = useState(false)

  const handleAddFolder = async () => {
    const parentPath = item ? tree[item.fullPath] : ''
    const uniqueFolderName = getUniqueFolderName(
      newFolderName,
      tree,
      baseFolderName,
      false,
    )
    const newFolderIndex = `${
      parentPath && parentPath.index + '/'
    }${uniqueFolderName}`

    await createFolder(newFolderIndex, uniqueFolderName)

    setNewFolderName(baseFolderName)
    setShowInput(false)
    close()
  }

  const handleCancel = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setShowInput(false)
    setNewFolderName(baseFolderName)
  }

  return (
    <li
      className={`${className} ${showInput && 'bg-gray-300'} relative`}
      onClick={() => setShowInput(true)}
    >
      <div className="flex items-center space-x-2">
        <span className="flex items-center space-x-2">
          <FaPlus />
          <span>Add Folder</span>
        </span>
        {showInput && (
          <div className="absolute left-full top-[-5px] z-10 ml-2 rounded-sm border border-gray-300 bg-white p-1 shadow-lg">
            <div className="flex flex-col space-y-2">
              <input
                className="rounded-sm px-3 py-1 shadow outline outline-gray-200 focus:outline-gray-300"
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                value={newFolderName}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className={`${
                    newFolderName.length === 0
                      ? 'bg-gray-200 hover:bg-gray-200'
                      : 'hover:bg-blue-700'
                  } rounded-sm bg-blue-500 px-3 py-1 text-white`}
                  disabled={newFolderName.length === 0}
                  onClick={handleAddFolder}
                >
                  Add
                </button>
                <button
                  className="rounded-sm bg-red-500 px-3 py-1 text-white hover:bg-red-700"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

export default AddFolder
