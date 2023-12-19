import { DownloadOutlined } from '@ant-design/icons'

type ExportFilesTextProps = {
  showText: boolean
}

const HintMessage = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl bg-white">
    <div className="mt-4 flex flex-col">
      <div className="text-center text-base font-medium leading-6 text-black text-opacity-80">
        Drag your uploaded files or folders here
      </div>
      <div className="mt-1 text-center text-sm leading-5 text-black text-opacity-50">
        All of the files here can be exported as ZIP. You can also create new
        samples and reactions using the buttons above.
      </div>
    </div>
  </div>
)

const ExportFilesText = ({ showText }: ExportFilesTextProps) => (
  <div className="absolute left-3/4 top-1/2 w-1/3 -translate-x-1/2 -translate-y-1/2">
    <DownloadOutlined className="flex justify-center text-8xl text-gray-100" />
    {showText ? <HintMessage /> : ''}
  </div>
)
export { ExportFilesText }
