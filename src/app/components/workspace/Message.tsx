type Message = {
  percent: number
  sumSize: number
  title: string
  uploadedSize: number
}

const Message = ({ percent, sumSize, title, uploadedSize }: Message) => {
  // TODO: Implement circular bar for running upload progress
  return (
    <div className="flex gap-4 rounded-full border border-black/0  bg-white p-4 shadow-lg">
      <img
        className="aspect-square w-10 max-w-full shrink-0 overflow-hidden object-contain object-center"
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/12312231-6ea7-48a5-9cee-d899b2fb9ed2?"
      />
      <div className="flex flex-col justify-center">
        <div className="whitespace-nowrap text-sm font-medium leading-5 text-gray-900">
          {title}
        </div>
        <div className="mt-1 flex items-stretch justify-between gap-1">
          <div className="text-xs font-medium leading-5 text-gray-600">
            {percent.toFixed(1)}%
          </div>
          <div className="whitespace-nowrap text-xs font-medium leading-5 text-gray-600">
            {uploadedSize}/{sumSize} MB
          </div>
        </div>
      </div>
      <img
        className="my-auto aspect-square w-5 max-w-full shrink-0 self-center overflow-hidden object-contain object-center"
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/54a467d4-c460-43fb-ba3a-07d0371fb6ef?"
      />
    </div>
  )
}

export { Message }
