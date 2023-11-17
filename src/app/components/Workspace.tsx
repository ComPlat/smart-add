'use client'

import { ExportFiles } from './workspace/ExportFiles'
import Sidebar from './workspace/Sidebar'
import { UploadedFiles } from './workspace/UploadedFiles'

const Workspace = () => {
  return (
    <div className="flex flex-col bg-gray-100">
      <div className="flex w-full flex-col justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
        <p className="p-2">Chemotion Logo</p>
      </div>
      <div className="mt-4 px-5">
        <div className="flex gap-5">
          <Sidebar />
          <UploadedFiles />
          <ExportFiles />
        </div>
      </div>
    </div>
  )
}

export default Workspace
