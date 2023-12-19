import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { DeleteOutlined } from '@ant-design/icons'
import { FC, useRef, useState } from 'react'

import deleteFile from './deleteFile'
import deleteFolder from './deleteFolder'
import classes from './popup.module.css'

interface DeleteProps {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const Delete: FC<DeleteProps> = ({ className, close, item, tree }) => {
  const popupRef = useRef(null)

  const [showConfirmation, setShowConfirmation] = useState(false)

  useOnClickOutside(popupRef, () => setShowConfirmation(false))

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault()

    if (!item.isFolder) deleteFile(item as ExtendedFile)
    else deleteFolder(item, tree)

    close()
  }

  const handleCancel = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setShowConfirmation(false)
  }

  return (
    <li
      className={`${className} ${showConfirmation && 'bg-gray-300'} relative`}
      onClick={() => setShowConfirmation(true)}
    >
      <span>
        <DeleteOutlined className="text-red-500" />
        <span className="ml-2">Delete</span>
      </span>
      {showConfirmation && (
        <div
          className={`${classes['emerge-from-lamp']} absolute left-full top-[-5px] z-10 ml-2 rounded-lg border border-gray-300 bg-white p-1 shadow-lg`}
          ref={popupRef}
        >
          <div className="flex flex-col space-y-1">
            <span className="w-auto min-w-[150px] max-w-[300px] whitespace-nowrap rounded-sm p-1 text-center shadow">
              Delete &quot;{item.name}&quot;?
            </span>
            <div className="flex justify-end space-x-2">
              <button
                className="flex-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-700"
                onClick={handleDelete}
              >
                Confirm
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

export default Delete
