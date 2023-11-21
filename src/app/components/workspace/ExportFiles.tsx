import { ButtonGroup } from './ButtonGroup'
import { ExportTree } from './ExportTree'

const ExportFiles = () => {
  // TODO: Replace image placeholder with real components
  // TODO: Adjust css correctly
  return (
    <div className="ml-5 flex w-full flex-col">
      <div className="flex grow flex-col">
        <h3 className="justify-center text-base font-bold leading-6 text-gray-900">
          Export
        </h3>
        <div className="mt-4 flex h-full w-full flex-col rounded-3xl bg-white shadow-sm">
          <ButtonGroup />
          <ExportTree />
        </div>
      </div>
    </div>
  )
}

export { ExportFiles }
