import { Fragment } from 'react'

import { ArchiveIcon } from './icons/ArchiveIcon'
import { ChevronDownIcon } from './icons/ChevronDownIcon'
import { FileIcon } from './icons/FileIcon'
import { ImageIcon } from './icons/ImageIcon'

type FileDataProps = {
  label: string
  type: 'archive' | 'document' | 'file' | 'image' | 'spreadsheet'
}

const FileData = ({ label, type }: FileDataProps) => {
  return (
    <div className="flex w-auto gap-2">
      <div className="flex items-center justify-between gap-2">
        {type === 'archive' ? (
          <Fragment>
            <ChevronDownIcon className="h-2 w-2 self-center" />
            <ArchiveIcon className="h-4 w-4 self-center text-kit-primary-full" />
          </Fragment>
        ) : type === 'file' ? (
          <Fragment>
            <ChevronDownIcon className="h-2 w-2 self-center text-transparent" />
            <FileIcon className="h-4 w-4 self-center" />
          </Fragment>
        ) : type === 'image' ? (
          <Fragment>
            <ImageIcon className="h-4 w-4 self-center text-kit-primary-full" />
          </Fragment>
        ) : (
          ''
        )}
      </div>
      <div className="truncate text-xs leading-7 text-gray-600">{label}</div>
    </div>
  )
}

export { FileData }
