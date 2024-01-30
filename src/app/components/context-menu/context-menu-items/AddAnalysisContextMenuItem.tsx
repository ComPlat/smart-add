import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa'

import { createAnalysis } from '../../structure-btns/templates'
import Modal from './Modal'

interface AddAnalysisProps {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder | undefined
  tree: Record<string, FileNode>
}

const AddAnalysisContextMenuItem: FC<AddAnalysisProps> = ({
  className,
  close,
  item,
  tree,
}) => {
  const baseName = 'analysis'

  const popupRef = useRef(null)

  const [folderName, setFolderName] = useState(baseName)
  const [showInput, setShowInput] = useState(false)

  useOnClickOutside(popupRef, () => showInput && setShowInput(false))

  const handleAddAnalysis = async () => {
    if (item) createAnalysis(folderName, item.fullPath, tree)

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
    e.key === 'Enter' && folderName.length > 0 && handleAddAnalysis()

  return (
    <li
      className={`${className} ${showInput && 'bg-gray-300'} relative`}
      onClick={() => setShowInput(true)}
    >
      <div className="flex items-center space-x-2">
        <span className="flex items-center space-x-2">
          <FaPlus />
          <span>Add Analysis</span>
        </span>
        {showInput && (
          <Modal
            folderName={folderName}
            handleCancel={handleCancel}
            handleKeyPress={handleKeyPress}
            handleOk={handleAddAnalysis}
            onChange={(e) => setFolderName(e.target.value)}
            popupRef={popupRef}
          />
        )}
      </div>
    </li>
  )
}

export default AddAnalysisContextMenuItem
