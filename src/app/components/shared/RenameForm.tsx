import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useRename } from '@/hooks/useRename'
import { FC, useEffect, useRef } from 'react'

interface RenameFormProps {
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
  onDone: () => void
  onCancel: () => void
}

const RenameForm: FC<RenameFormProps> = ({ item, tree, onDone, onCancel }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { newName, isValid, validate, reset, executeRename } = useRename(
    item,
    tree,
    onDone,
  )

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  const handleCancel = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation()
    reset()
    onCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <form onSubmit={executeRename} className="flex flex-col gap-2">
      <input
        ref={inputRef}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        onChange={(e) => validate(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter new name"
        value={newName}
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`rounded px-3 py-1 text-sm text-white ${
            isValid
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'cursor-not-allowed bg-gray-300'
          }`}
          disabled={!isValid}
        >
          Rename
        </button>
      </div>
    </form>
  )
}

export default RenameForm
