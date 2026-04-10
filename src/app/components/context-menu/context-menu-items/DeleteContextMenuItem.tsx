import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { FC, useRef, useState } from 'react'
import { FaDeleteLeft } from 'react-icons/fa6'
import DeleteConfirm from '../../shared/DeleteConfirm'

interface DeleteProps {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const DeleteContextMenuItem: FC<DeleteProps> = ({
  className,
  close,
  item,
  tree,
}) => {
  const popupRef = useRef<HTMLDivElement>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useOnClickOutside(popupRef, () => setShowConfirmation(false))

  return (
    <li
      className={`${className} ${showConfirmation && 'bg-gray-300'} relative`}
      onClick={() => setShowConfirmation(true)}
    >
      <span className="flex items-center space-x-2">
        <FaDeleteLeft className="text-red-500" />
        <span>Delete</span>
      </span>
      {showConfirmation && (
        <div
          className="absolute left-full top-[-5px] z-10 ml-2 origin-left-center animate-emerge-from-lamp rounded-lg border border-gray-300 bg-white p-1 shadow-lg"
          ref={popupRef}
        >
          <DeleteConfirm
            item={item}
            tree={tree}
            onDone={close}
            onCancel={() => setShowConfirmation(false)}
          />
        </div>
      )}
    </li>
  )
}

export default DeleteContextMenuItem
