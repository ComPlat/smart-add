import { ReactNode } from 'react'

const UploadedFiles = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full flex-col overflow-auto">
    <div className="flex-1 flex-col bg-white px-4 shadow-sm">{children}</div>
  </div>
)

export { UploadedFiles }
