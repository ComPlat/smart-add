import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { FC, useState } from 'react'
import { FaEdit } from 'react-icons/fa'

import renameFile from './renameFile'
import renameFolder from './renameFolder'

interface RenameProps {
  close: () => void
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const Rename: FC<RenameProps> = ({ close, item, tree }) => {
  const [newName, setNewName] = useState(item.name)
  const [showInput, setShowInput] = useState(false)

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
    <li className="relative" onClick={() => setShowInput(true)}>
      <span className="flex items-center space-x-2">
        <FaEdit />
        <span>Rename</span>
      </span>
      {showInput && (
        <div className="absolute left-full top-[-5px] z-10 ml-2 rounded-sm border border-gray-300 bg-white p-1 shadow-lg">
          <div className="flex flex-col space-y-2">
            <input
              className="rounded-sm px-3 py-1 text-gray-700 shadow focus:outline-none"
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
                } rounded-sm bg-blue-500 px-3 py-1 text-white`}
                disabled={newName.length === 0}
                onClick={handleRename}
              >
                Rename
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
    </li>
  )
}

export default Rename
