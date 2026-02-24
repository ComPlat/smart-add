import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { FC } from 'react'

import deleteFile from '../context-menu/deleteFile'
import deleteFolder from '../context-menu/deleteFolder'

interface DeleteConfirmProps {
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
  onDone: () => void
  onCancel: () => void
}

const DeleteConfirm: FC<DeleteConfirmProps> = ({
  item,
  tree,
  onDone,
  onCancel,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!item.isFolder) deleteFile(item as ExtendedFile)
    else deleteFolder(item as ExtendedFolder, tree)
    onDone()
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCancel()
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        Delete{' '}
        <span className="font-medium underline" title={item.name}>
          {item.name}
        </span>
        ?
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          onClick={handleDelete}
          autoFocus
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default DeleteConfirm
