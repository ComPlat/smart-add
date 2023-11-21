import { ChevronDownIcon } from './icons/ChevronDownIcon'
import { ChevronRightIcon } from './icons/ChevronRightIcon'

type FolderProps = {
  empty?: boolean
  label: string
  level?: number
  open?: boolean
  selected?: boolean
}

const Folder = ({ empty, label, level = 1, open, selected }: FolderProps) => (
  <div
    className={`${
      selected ? 'bg-kit-primary-light' : ''
    } flex items-center gap-2 rounded-md px-4 ${'ml-' + level * 2}`}
  >
    {open ? (
      <ChevronDownIcon
        className={`h-2 w-2 self-center ${
          empty ? 'text-gray-400' : 'text-gray-900'
        } dark:text-white`}
      />
    ) : (
      <ChevronRightIcon
        className={`h-2 w-2 self-center ${
          empty ? 'text-gray-400' : 'text-gray-900'
        } dark:text-white`}
      />
    )}
    <p
      className={`p-1 text-xs leading-5 ${
        empty ? 'text-gray-400' : 'text-gray-900'
      }`}
    >
      {label}
    </p>
  </div>
)

const ExportTree = () => {
  return (
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
        <div className="mt-2 flex w-full flex-col gap-2 self-start px-2">
          <Folder empty label="structure" />
          <Folder label="analyses" open selected />
        </div>
        <div className="mt-2 flex flex-col">
          <div className="flex flex-col items-stretch rounded-lg">
            <Folder label="analysis_1.1" level={2} open />
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
          <div className="mt-2 flex flex-col">
            <Folder label="analysis_1.2" level={2} />
            <Folder label="analysis_1.3" level={2} />
          </div>
        </div>
      </div>
    </div>
  )
}

export { ExportTree }
