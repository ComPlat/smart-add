'use client'

import { ExportFiles } from './workspace/ExportFiles'
import Header from './workspace/Header'
import Sidebar from './workspace/Sidebar'
import { UploadedFiles } from './workspace/UploadedFiles'

const Workspace = () => {
  return (
    <div className="flex h-screen w-screen flex-col bg-gray-100 p-4">
      <Header />
      <div className="mt-4">
        <div className="flex h-full">
          <Sidebar />
          <UploadedFiles />
          <ExportFiles />
        </div>
      </div>
    </div>
  )
}

export default Workspace
