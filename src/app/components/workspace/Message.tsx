import { ProgressBar } from './ProgressBar'
import { CloseIcon } from './icons/CloseIcon'

type MessageProps = {
  percent: number
  sumSize: number
  title: string
  uploadedSize: number
}

const Message = ({ percent, sumSize, title, uploadedSize }: MessageProps) => (
  <div className="flex gap-4 rounded-full border border-black/0 bg-white p-4 shadow-lg">
    <ProgressBar progress={percent} />
    <div className="flex flex-col justify-center">
      <div className="whitespace-nowrap text-sm font-medium leading-5 text-gray-900">
        {title}
      </div>
      <div className="mt-1 flex justify-between gap-1">
        <div className="text-xs font-medium leading-5 text-gray-600">
          {percent.toFixed(1)}%
        </div>
        <div className="whitespace-nowrap text-xs font-medium leading-5 text-gray-600">
          {uploadedSize}/{sumSize} MB
        </div>
      </div>
    </div>
    <button
      onClick={() => {
        {
          /* TODO: Dismiss and hide me! */
        }
      }}
      className="my-auto h-8 w-8 text-lg text-gray-800 duration-150 hover:text-kit-primary-full"
    >
      {/* TODO: Put me into center of the div. */}
      <CloseIcon />
    </button>
  </div>
)

export { Message }
