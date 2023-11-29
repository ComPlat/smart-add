import { ReactNode } from 'react'

import ParseXlsx from '../upload-form/ParseXlsx'
import { UploadDropZone } from '../upload-form/UploadDropZone'

const UploadedFiles = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full flex-col overflow-hidden">
    <div className="flex grow flex-col">
      <h3 className="justify-center whitespace-nowrap text-base font-bold leading-6 text-gray-900">
        Uploaded files
      </h3>
      <div className="mt-4 flex h-full flex-col gap-4 rounded-3xl border-2 border-dashed border-gray-300 bg-white px-4 shadow-sm">
        <UploadDropZone />
        {children}
        <ParseXlsx />
      </div>
    </div>
  </div>
)

export { UploadedFiles }
