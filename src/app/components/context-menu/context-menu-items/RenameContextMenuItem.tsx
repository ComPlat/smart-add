import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef, useState } from 'react'
import { FaEdit } from 'react-icons/fa'
import RenameForm from '../../shared/RenameForm'

interface RenameProps {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const RenameContextMenuItem: FC<RenameProps> = ({
  className,
  close,
  item,
  tree,
}) => {
  const popupRef = useRef(null)
  const [showInput, setShowInput] = useState(false)

  useOnClickOutside(popupRef, () => showInput && setShowInput(false))

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
          className="absolute left-full top-[-5px] z-10 ml-2 origin-left-center animate-emerge-from-lamp rounded-lg border border-gray-300 bg-white p-1 shadow-lg"
          ref={popupRef}
        >
          <RenameForm
            item={item}
            tree={tree}
            onDone={close}
            onCancel={() => setShowInput(false)}
          />
        </div>
      )}
    </li>
  )
}

export default RenameContextMenuItem
