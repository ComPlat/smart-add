import { FaCloudDownloadAlt } from 'react-icons/fa'

type ExportFilesTextProps = {
  showText: boolean
}

const HintMessage = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl bg-white">
    <div className="mt-4 flex flex-col">
      <div className="text-center text-base font-medium leading-6">
        Drag your uploaded files or folders here
      </div>
      <div className="mt-1 text-center text-sm leading-5 text-gray-500">
        All of the files here can be exported as ZIP. You can also create new
        samples and reactions using the buttons above.
      </div>
    </div>
  </div>
)

const ExportFilesText = ({ showText }: ExportFilesTextProps) => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center p-8">
      <FaCloudDownloadAlt className="flex justify-center text-8xl !text-gray-200" />
      {showText && <HintMessage />}
    </div>
  </div>
)
export { ExportFilesText }
