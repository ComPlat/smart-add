import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef, useState } from 'react'
import { FaEdit } from 'react-icons/fa'

import classes from './popup.module.css'
import renameFile from './renameFile'
import renameFolder from './renameFolder'

interface RenameProps {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const Rename: FC<RenameProps> = ({ className, close, item, tree }) => {
  const popupRef = useRef(null)

  const [newName, setNewName] = useState(item.name)
  const [showInput, setShowInput] = useState(false)

  useOnClickOutside(popupRef, () => showInput && setShowInput(false))

  const handleCancel = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setShowInput(false)
    setNewName(item.name)
  }

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault()

    if (!item.isFolder) renameFile(item as ExtendedFile, newName)
    else renameFolder(item as ExtendedFolder, tree, newName)

    close()
  }

  return (
    <li
      className={`${className} ${showInput && 'bg-gray-300'} relative`}
      onClick={() => setShowInput(true)}
    >
      <span className="flex items-center space-x-2">
        <FaEdit />
        <span>Rename</span>
      </span>
      {showInput && (
        <div
          className={`${classes['emerge-from-lamp']} absolute left-full top-[-5px] z-10 ml-2 rounded-lg border border-gray-300 bg-white p-1 shadow-lg`}
          ref={popupRef}
        >
          <div className="flex flex-col space-y-1">
            <input
              className="rounded px-3 py-1 shadow focus:outline-none"
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new folder name"
              value={newName}
            />
            <div className="flex justify-end space-x-2">
              <button
                className={`${
                  newName.length === 0
                    ? 'bg-gray-200 hover:bg-gray-200'
                    : 'hover:bg-blue-700'
                } flex-1 rounded bg-blue-500 px-3 py-1 text-white`}
                disabled={newName.length === 0}
                onClick={handleRename}
              >
                Rename
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
    </li>
  )
}

export default Rename
