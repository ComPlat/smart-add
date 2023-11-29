import { ReactNode } from 'react'

import { ButtonGroup } from './ButtonGroup'

const ExportFiles = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex w-full flex-col">
      <div className="flex grow flex-col">
        <h3 className="justify-center text-base font-bold leading-6 text-gray-900">
          Export
        </h3>
        <div className="mt-4 flex h-full flex-col rounded-3xl bg-white px-4 shadow-sm">
          <ButtonGroup />
          {children}
        </div>
      </div>
    </div>
  )
}

export { ExportFiles }
