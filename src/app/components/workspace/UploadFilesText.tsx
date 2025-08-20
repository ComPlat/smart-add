import { FaCloudUploadAlt } from 'react-icons/fa'

type UploadFilesTextProps = {
  showText: boolean
}

const HintMessage = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl bg-white">
    <div className="mt-4 flex flex-col">
      <div className="text-center text-base font-medium leading-6">
        Drag your files or folders to this area to upload
      </div>
      <div className="mt-1 text-center text-sm leading-5 text-gray-500">
        None of the files will be uploaded to a server. Files will be saved in a
        browser database.
      </div>
    </div>
  </div>
)

const UploadFilesText = ({ showText }: UploadFilesTextProps) => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center p-8">
      <FaCloudUploadAlt className="flex justify-center text-8xl !text-gray-200" />
      {showText && <HintMessage />}
    </div>
  </div>
)
export { UploadFilesText }
