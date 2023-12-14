import { ReactNode } from 'react'

const ExportFiles = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex w-full flex-col">
      <div className="flex grow flex-col">
        <div className="flex h-full flex-col bg-white px-4 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

export { ExportFiles }
