import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { DeleteOutlined } from '@ant-design/icons'

import deleteFile from './deleteFile'
import deleteFolder from './deleteFolder'

const Delete = ({
  className,
  close,
  item,
  tree,
}: {
  className?: string
  close: () => void
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}) => {
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
