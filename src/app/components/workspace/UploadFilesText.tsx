import { UploadOutlined } from '@ant-design/icons'

type UploadFilesTextProps = {
  showText: boolean
}

const HintMessage = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl bg-white">
    <div className="mt-4 flex flex-col">
      <div className="text-center text-base font-medium leading-6 text-black text-opacity-80">
        Drag your files or folders to this area to upload
      </div>
      <div className="mt-1 text-center text-sm leading-5 text-black text-opacity-50">
        None of the files will be uploaded to a server. Files will be saved in a
        browser database.
      </div>
    </div>
  </div>
)

const UploadFilesText = ({ showText }: UploadFilesTextProps) => (
  <div className="absolute left-1/4 top-1/2 w-1/3 -translate-x-1/2 -translate-y-1/2">
    <UploadOutlined className="flex justify-center text-8xl text-gray-100" />
    {showText ? <HintMessage /> : ''}
  </div>
)
export { UploadFilesText }
