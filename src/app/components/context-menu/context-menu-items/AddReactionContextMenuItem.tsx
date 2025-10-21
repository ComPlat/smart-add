import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa'

import { getUniqueFolderName } from '../../structure-btns/folderUtils'
import { createReaction } from '../../structure-btns/templates'
import Modal from './Modal'

interface AddAnalysisProps {
  className?: string
  close: () => void
  tree: Record<string, FileNode>
}

const AddReactionContextMenuItem: FC<AddAnalysisProps> = ({
  className,
  close,
  tree,
}) => {
  const baseName = 'Reaction'
  const baseSampleName = 'Sample'

  const popupRef = useRef(null)

  const [folderName, setFolderName] = useState(baseName)
  const [sampleName, setSampleName] = useState(baseSampleName)

  const [showInput, setShowInput] = useState(false)

  useOnClickOutside(popupRef, () => showInput && setShowInput(false))

  const handleAddReaction = async () => {
    const uniqueFolderName = getUniqueFolderName(folderName, tree, baseName, false, '')

    const uniqueSampleName = getUniqueFolderName(
      sampleName,
      tree,
      baseSampleName,
      false,
      uniqueFolderName,
    )
    await createReaction(uniqueFolderName, tree, uniqueSampleName)
    setFolderName(baseName)
    setSampleName(baseSampleName)

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
    e.key === 'Enter' && folderName.length > 0 && handleAddReaction()

  return (
    <li
      className={`${className} ${showInput && 'bg-gray-300'} relative`}
      onClick={() => setShowInput(true)}
    >
      <div className="flex items-center space-x-2">
        <span className="flex items-center space-x-2">
          <FaPlus />
          <span>Add Reaction</span>
        </span>
        {showInput && (
          <Modal
            folderName={folderName}
            handleCancel={handleCancel}
            handleKeyPress={handleKeyPress}
            handleOk={handleAddReaction}
            onChange={(e) => setFolderName(e.target.value)}
            popupRef={popupRef}
          />
        )}
      </div>
    </li>
  )
}

export default AddReactionContextMenuItem
