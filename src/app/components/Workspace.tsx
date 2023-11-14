'use client'

import { ExportFiles } from './workspace/ExportFiles'
import Sidebar from './workspace/Sidebar'
import { UploadedFiles } from './workspace/UploadedFiles'

const Workspace = () => {
  return (
    <div className="flex flex-col items-stretch self-stretch bg-gray-100">
      <div className="flex w-full flex-col justify-between rounded-lg bg-white px-4 py-2 shadow-sm max-md:max-w-full">
        <p className="p-2">Chemotion Logo</p>
      </div>
      <div className="mt-4 w-full px-5 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col max-md:items-stretch max-md:gap-0">
          <Sidebar />
          <UploadedFiles />
          <ExportFiles />
        </div>
      </div>
    </div>
  )
}

export default Workspace
