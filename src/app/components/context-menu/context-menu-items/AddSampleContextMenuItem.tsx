import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa'

import { getUniqueFolderName } from '../../structure-btns/folderUtils'
import { createSample } from '../../structure-btns/templates'

interface AddAnalysisProps {
  className?: string
  close: () => void
  tree: Record<string, FileNode>
}

const AddSampleContextMenuItem: FC<AddAnalysisProps> = ({
  className,
  close,
  tree,
}) => {
  const baseName = 'Sample'

  const popupRef = useRef(null)

  const [folderName, setFolderName] = useState(baseName)
  const [showInput, setShowInput] = useState(false)

  useOnClickOutside(popupRef, () => showInput && setShowInput(false))

  const handleAddSample = async () => {
    const uniqueFolderName = getUniqueFolderName(folderName, tree, baseName)

    await createSample(uniqueFolderName, tree)

    setFolderName(baseName)
    setShowInput(false)
    close()
  }

  const handleCancel = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setShowInput(false)
    setFolderName(baseName)
  }

  const handleKeyPress = (e: { key: string }) =>
    e.key === 'Enter' && folderName.length > 0 && handleAddSample()

  return (
    <li
      className={`${className} ${showInput && 'bg-gray-300'} relative`}
      onClick={() => setShowInput(true)}
    >
      <div className="flex items-center space-x-2">
        <span className="flex items-center space-x-2">
          <FaPlus />
          <span>Add Sample</span>
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
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter folder name"
                value={folderName}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className={`${
                    folderName.length === 0
                      ? 'bg-gray-200 hover:bg-gray-200'
                      : 'hover:bg-blue-700'
                  } flex-1 rounded bg-blue-500 px-3 py-1 text-white`}
                  disabled={folderName.length === 0}
                  onClick={handleAddSample}
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

export default AddSampleContextMenuItem
