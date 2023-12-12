import { EditIcon } from './icons/EditIcon'

type MenuItem = {
  label: string
}

const MenuItem = ({ label }: MenuItem) => (
  <button className="flex w-full items-center justify-center gap-4 rounded-lg bg-gray-700 p-4 duration-150 hover:bg-gray-500">
    <EditIcon className="h-6 w-6 object-center text-white" />
    <p className="whitespace-nowrap text-sm font-bold leading-5 text-white">
      {label}
    </p>
  </button>
)

export { MenuItem }
