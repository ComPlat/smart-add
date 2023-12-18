import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { DeleteOutlined } from '@ant-design/icons'
import { FC } from 'react'

import deleteFile from './deleteFile'
import deleteFolder from './deleteFolder'

interface DeleteProps {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}

const Delete: FC<DeleteProps> = ({ className, close, item, tree }) => {
  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault()

    if (!item.isFolder) deleteFile(item as ExtendedFile)
    else deleteFolder(item, tree)

    close()
  }

  return (
    <li className={`${className}`} onClick={handleDelete}>
      <span>
        <DeleteOutlined className="text-red-500" />
        <span className="ml-2">Delete</span>
      </span>
    </li>
  )
}

export default Delete
