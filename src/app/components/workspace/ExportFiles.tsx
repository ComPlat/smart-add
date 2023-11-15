import { ButtonGroup } from './ButtonGroup'

const ExportFiles = () => {
  // TODO: Replace image placeholder with real components
  // TODO: Adjust css correctly
  return (
    <div className="ml-5 flex w-[41%] flex-col items-stretch max-md:ml-0 max-md:w-full">
      <div className="flex grow flex-col items-stretch self-stretch max-md:mt-4 max-md:max-w-full">
        <h3 className="justify-center text-base font-bold leading-6 text-gray-900 max-md:max-w-full">
          Export
        </h3>
        <div className="mt-4 flex flex-col rounded-3xl bg-white pb-[498px] pt-8 shadow-sm max-md:max-w-full max-md:pb-24">
          <ButtonGroup />
          <div className="mb-0 mt-8 flex flex-col items-stretch self-stretch rounded-[30px] px-4 pt-2 max-md:mb-2.5 max-md:max-w-full">
            <div className="flex flex-col items-stretch rounded-lg max-md:max-w-full">
              <div className="flex w-[134px] max-w-full items-center gap-2 self-start">
                <img
                  className="my-auto aspect-square w-3 max-w-full shrink-0 overflow-hidden object-contain object-center"
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/00cee057-c7af-41ec-b9b2-cccc1219fb7d?"
                />
                <div className="text-xs font-bold leading-5 text-gray-900">
                  Sample_1
                </div>
              </div>
              <div className="ml-4 mt-2 flex w-[130px] max-w-full flex-col items-stretch self-start max-md:ml-2.5">
                <div className="flex items-center justify-between gap-1">
                  <img
                    className="my-auto aspect-square w-3 max-w-full shrink-0 overflow-hidden object-contain object-center"
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/39bd1718-e37a-4621-a6c3-a6be55c1ce47?"
                  />
                  <div className="text-xs leading-5 text-gray-400">
                    structure
                  </div>
                </div>
                <div className="mt-4 flex items-stretch justify-between gap-1">
                  <img
                    className="aspect-square w-3 max-w-full shrink-0 overflow-hidden object-contain object-center"
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/86b3ff1f-999a-4712-a64c-3a61d60951be?"
                  />
                  <div className="whitespace-nowrap text-xs leading-5 text-gray-600">
                    analyses
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col items-stretch py-0.5 max-md:max-w-full">
                <div className="flex flex-col items-stretch rounded-lg py-0.5 max-md:max-w-full">
                  <div className="flex items-center justify-between gap-1 rounded bg-blue-600 bg-opacity-20 py-1 pl-8 pr-96 max-md:max-w-full max-md:flex-wrap max-md:px-5">
                    <img
                      className="my-auto aspect-square w-3 max-w-full shrink-0 overflow-hidden object-contain object-center"
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/ffd290ea-c6d5-4f5d-a1bc-ad58c401998d?"
                    />
                    <div className="text-xs leading-5 text-gray-600">
                      analysis_1.1
                    </div>
                  </div>
                  <div className="ml-16 mt-2 flex w-[275px] max-w-full items-stretch gap-2 self-start rounded max-md:ml-2.5">
                    <img
                      className="aspect-square w-4 max-w-full shrink-0 overflow-hidden object-contain object-center"
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/35b257af-7398-491c-a1a0-5d779ae2c764?"
                    />
                    <div className="truncate text-xs leading-5 text-gray-600">
                      e8dba3681d3a3bb8afa398d266372566.jpg
                    </div>
                  </div>
                </div>
                <div className="ml-8 mt-2 flex w-[130px] max-w-full flex-col items-stretch self-start max-md:ml-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <img
                      className="my-auto aspect-square w-3 max-w-full shrink-0 overflow-hidden object-contain object-center"
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/0648c55c-0cb5-4ceb-b733-fbffae8d2d82?"
                    />
                    <div className="text-xs leading-5 text-gray-600">
                      analysis_1.2
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-1">
                    <img
                      className="my-auto aspect-square w-3 max-w-full shrink-0 overflow-hidden object-contain object-center"
                      loading="lazy"
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/153f5b8d-44f3-41ef-b52e-a4fb37d24cfc?"
                    />
                    <div className="text-xs leading-5 text-gray-600">
                      analysis_1.3
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { ExportFiles }
