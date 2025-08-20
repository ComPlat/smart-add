'use client'

import { filesDB } from '@/database/db'
import { FaPaperclip } from 'react-icons/fa6'
import { useLiveQuery } from 'dexie-react-hooks'

import { DeleteFileButton } from './DeleteFileButton'

const FileList = () => {
  const files = useLiveQuery(() => filesDB.files.toArray()) || []

  return (
    <div className="flex flex-col gap-2">
      {files.map((file) => (
        <div
          className="flex justify-between text-sm transition-all hover:bg-neutral-100"
          key={file.id}
        >
          <div className="flex gap-2">
            <FaPaperclip />
            <p className="data-file-path: mr-3 line-clamp-1 text-neutral-900">
              {'name' in file.file ? file.file.name : 'Unknown file'}
            </p>
          </div>
          <DeleteFileButton file={file} />
        </div>
      ))}
    </div>
  )
}

export { FileList }
