import { useState } from 'react'

import { FileData } from './FileData'
import { ChevronDownIcon } from './icons/ChevronDownIcon'
import { ChevronRightIcon } from './icons/ChevronRightIcon'

type FolderProps = {
  empty?: boolean
  label: string
  level?: number
  selected?: boolean
}

const Folder = ({ empty, label, level = 1, selected }: FolderProps) => {
  const [open, setOpen] = useState(false)

  return (
    <button
      className={`${
        selected ? 'bg-kit-primary-light' : ''
      } flex items-center gap-2 rounded-md px-4 ${'ml-' + level * 2}`}
      onClick={() => setOpen(!open)}
    >
      {open ? (
        <ChevronDownIcon
          className={`h-2 w-2 self-center ${
            empty ? 'text-gray-400' : 'text-gray-900'
          }`}
        />
      ) : (
        <ChevronRightIcon
          className={`h-2 w-2 self-center ${
            empty ? 'text-gray-400' : 'text-gray-900'
          }`}
        />
      )}
      <p
        className={`p-1 text-xs leading-5 ${
          empty ? 'text-gray-400' : 'text-gray-900'
        }`}
      >
        {label}
      </p>
    </button>
  )
}

const ExportTree = () => {
  return (
    <div className="mb-0 mt-8 flex flex-col px-4 pt-2">
      <div className="flex flex-col">
        <div className="flex w-auto items-center gap-2">
          <ChevronDownIcon className="h-2 w-2" />
          <div className="text-xs font-bold leading-5 text-gray-900">
            Sample_1
          </div>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2">
          <Folder empty label="structure" />
          <Folder label="analyses" selected />
        </div>
        <div className="mt-2 flex flex-col">
          <div className="flex flex-col rounded-lg">
            <Folder label="analysis_1.1" level={2} />
            <div className="ml-12">
              <FileData
                label="e8dba3681d3a3bb8afa398d266372566.jpg"
                type="image"
              />
            </div>
          </div>
          <div className="mt-2 flex flex-col">
            <Folder label="analysis_1.2" level={2} />
            <Folder label="analysis_1.3" level={2} />
          </div>
        </div>
      </div>
    </div>
  )
}

export { ExportTree }
