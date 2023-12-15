import { ReactNode } from 'react'

const ExportFiles = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full flex-col overflow-auto">
    <div className="flex grow flex-col">
      <div className="flex-1 flex-col bg-white px-2 py-4 shadow-sm">
        {children}
      </div>
    </div>
  </div>
)

export { ExportFiles }
