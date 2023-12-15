import { ReactNode } from 'react'

const UploadedFiles = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full flex-col overflow-hidden">
    <div className="flex grow flex-col">
      <div className="flex flex-col gap-4 border-gray-300 bg-white p-4 shadow-sm">
        {children}
      </div>
    </div>
  </div>
)

export { UploadedFiles }
