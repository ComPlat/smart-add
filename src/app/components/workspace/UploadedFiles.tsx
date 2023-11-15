import { UploadDropZone } from '../upload-form/UploadDropZone'
import { FileTree } from './FileTree'

const UploadedFiles = () => {
  return (
    <div className="ml-5 flex w-[41%] flex-col items-stretch max-md:ml-0 max-md:w-full">
      <div className="flex grow flex-col items-stretch self-stretch max-md:mt-4 max-md:max-w-full">
        <h3 className="justify-center whitespace-nowrap text-base font-bold leading-6 text-gray-900 max-md:max-w-full">
          Uploaded files
        </h3>
        <div className="mt-4 flex flex-col items-stretch rounded-3xl border-2 border-dashed border-[color:var(--gray-300,#D1D5DB)] bg-white px-2 pb-[463px] shadow-sm max-md:max-w-full max-md:pb-24">
          <UploadDropZone />
          <FileTree />
        </div>
      </div>
    </div>
  )
}

export { UploadedFiles }
