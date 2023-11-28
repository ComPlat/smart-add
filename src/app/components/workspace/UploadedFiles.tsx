import ParseXlsx from '../upload-form/ParseXlsx'
import { UploadDropZone } from '../upload-form/UploadDropZone'
import { FileTree } from './FileTree'
import { TreeView } from './TreeView'

const UploadedFiles = () => (
  <div className="ml-5 flex w-full flex-col">
    <div className="flex grow flex-col">
      <h3 className="justify-center whitespace-nowrap text-base font-bold leading-6 text-gray-900">
        Uploaded files
      </h3>
      <div className="mt-4 flex h-full flex-col rounded-3xl border-2 border-dashed border-gray-300 bg-white px-2 shadow-sm">
        <UploadDropZone />
        <FileTree />
        <TreeView />
        <ParseXlsx />
      </div>
    </div>
  </div>
)

export { UploadedFiles }
