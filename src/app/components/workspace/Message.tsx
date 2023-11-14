type Message = {
  percent: number
  sumSize: number
  title: string
  uploadedSize: number
}

const Message = ({ percent, sumSize, title, uploadedSize }: Message) => {
  return (
    <div className="flex gap-4 rounded-[100px] border border-solid border-black border-opacity-0 bg-white p-4 shadow-sm max-md:justify-center">
      <img
        className="aspect-square w-10 max-w-full shrink-0 overflow-hidden object-contain object-center"
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/12312231-6ea7-48a5-9cee-d899b2fb9ed2?"
      />
      <div className="flex grow basis-[0%] flex-col items-stretch justify-center self-stretch">
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
