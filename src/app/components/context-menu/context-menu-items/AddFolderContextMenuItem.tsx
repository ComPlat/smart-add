import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa'

import {
  createFolder,
  getUniqueFolderName,
} from '../../structure-btns/folderUtils'

interface AddFolderProps {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder | undefined
  tree: Record<string, FileNode>
}

const AddFolderContextMenuItem: FC<AddFolderProps> = ({
  className,
  close,
  item,
  tree,
}) => {
  const baseFolderName = 'New Folder'

  const popupRef = useRef(null)

  const [newFolderName, setNewFolderName] = useState(baseFolderName)
  const [showInput, setShowInput] = useState(false)

  useOnClickOutside(popupRef, () => showInput && setShowInput(false))

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

  const handleKeyPress = (e: { key: string }) =>
    e.key === 'Enter' && newFolderName.length > 0 && handleAddFolder()

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
          <div
            className="absolute left-full top-[-5px] z-10 ml-2 origin-left-center animate-emerge-from-lamp rounded-lg border border-gray-300 bg-white p-1 shadow-lg "
            ref={popupRef}
          >
            <div className="flex flex-col space-y-1">
              <input
                autoFocus
                className="rounded px-3 py-1 shadow outline outline-gray-200 focus:outline-gray-300"
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter folder name"
                value={newFolderName}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className={`${
                    newFolderName.length === 0
                      ? 'bg-gray-200 hover:bg-gray-200'
                      : 'hover:bg-blue-700'
                  } flex-1 rounded bg-blue-500 px-3 py-1 text-white`}
                  disabled={newFolderName.length === 0}
                  onClick={handleAddFolder}
                >
                  Add
                </button>
                <button
                  className="flex-1 rounded bg-red-500 px-3 py-1 text-white hover:bg-red-700"
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

export default AddFolderContextMenuItem
