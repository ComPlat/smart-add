import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef, useState } from 'react'
import { FaPlus } from 'react-icons/fa'

import { getUniqueFolderName } from '../../structure-btns/folderUtils'
import { createSample } from '../../structure-btns/templates'
import Modal from './Modal'

interface AddSampleProps {
  className?: string
  close: () => void
  item?: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const AddSampleContextMenuItem: FC<AddSampleProps> = ({
  className,
  close,
  item,
  tree,
}) => {
  const baseName = 'Sample'

  const popupRef = useRef(null)

  const [folderName, setFolderName] = useState(baseName)
  const [showInput, setShowInput] = useState(false)

  useOnClickOutside(popupRef, () => showInput && setShowInput(false))

  const handleAddSample = async () => {
    const uniqueFolderName = getUniqueFolderName(
      folderName,
      tree,
      baseName,
      false,
      item?.fullPath || '',
    )

    if (item) {
      await createSample(uniqueFolderName, tree, item.fullPath, item.uid)
    } else {
      await createSample(uniqueFolderName, tree)
    }

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
          <Modal
            folderName={folderName}
            handleCancel={handleCancel}
            handleKeyPress={handleKeyPress}
            handleOk={handleAddSample}
            onChange={(e) => setFolderName(e.target.value)}
            popupRef={popupRef}
          />
        )}
      </div>
    </li>
  )
}

export default AddSampleContextMenuItem
