import { ExtendedFile, ExtendedFolder, filesDB } from '@/database/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'

interface TextInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  value?: string
}

const TextInputField: React.FC<TextInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  placeholder = 'Enter text...',
  value,
}) => (
  <label className="flex flex-col">
    {name}
    <input
      autoFocus={autoFocus}
      className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  </label>
)

interface NumberInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  value?: number
}

const NumberInputField: React.FC<NumberInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  placeholder = 'Enter number...',
  value,
}) => (
  <label className="flex flex-col">
    {name}
    <input
      autoFocus={autoFocus}
      className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type="number"
      value={value}
    />
  </label>
)

interface DateInputFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  value?: string
}

const DateInputField: React.FC<DateInputFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  placeholder = 'Enter date...',
  value,
}) => (
  <label className="flex flex-col">
    {name}
    <input
      autoFocus={autoFocus}
      className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type="date"
      value={value}
    />
  </label>
)

interface CheckboxFieldProps {
  checked: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  checked = false,
  className = '',
  id,
  name,
  onChange,
}) => (
  <label className="flex gap-2">
    <input
      checked={checked}
      className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
      id={id}
      name={name}
      onChange={onChange}
      type="checkbox"
    />
    {name}
  </label>
)

interface TextareaFieldProps {
  autoFocus?: boolean
  className?: string
  id?: string
  name: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
  placeholder?: string
  rows?: number
  value?: string
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  autoFocus = false,
  className = '',
  id,
  name,
  onChange,
  placeholder = 'Enter text...',
  rows = 3,
  value,
}) => (
  <label className="flex flex-col">
    {name}
    <textarea
      autoFocus={autoFocus}
      className={`rounded border px-3 py-1 outline-gray-200 hover:border-kit-primary-full focus:border-kit-primary-full ${className}`}
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      value={value}
    />
  </label>
)

const InspectorSidebar = ({
  focusedItem,
}: {
  focusedItem: (TreeItemIndex & (TreeItemIndex | TreeItemIndex[])) | undefined
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [retrievedItem, setRetrievedItem] = useState<
    ExtendedFile[] | ExtendedFolder[] | undefined
  >()

  const handleClose = () => {
    setIsOpen(false)
  }

  const database = useLiveQuery(async () => {
    const files = await filesDB.files.toArray()
    const folders = await filesDB.folders.toArray()

    return { files, folders }
  })

  useEffect(() => {
    if (focusedItem) {
      const items = [
        ...(database?.files || []),
        ...(database?.folders || []),
      ].filter((item) => item.fullPath === focusedItem)

      if (items.length > 0) {
        setRetrievedItem(items)
        setIsOpen(true)
      }
    }
  }, [database?.files, database?.folders, focusedItem])

  return (
    <>
      {isOpen && retrievedItem && (
        <aside
          className={`right-0 top-0 ml-2 w-[30vw] flex-col rounded-tl-xl bg-white ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } z-40 max-h-screen overflow-y-auto p-4 duration-300 ease-in-out`}
        >
          <div className="flex flex-col gap-4">
            <button onClick={handleClose}>
              <svg
                className="absolute right-2 top-2 h-6 w-6 cursor-pointer duration-100 hover:text-kit-primary-full"
                fill="none"
                stroke="currentColor"
                viewBox="-8 -8 40 40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  fill="transparent"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 17L17 7M7 7l10 10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
            <p className="font-bold">
              {retrievedItem.map((item) => item.name)}
            </p>
            <div className="flex flex-col gap-4">
              <TextInputField
                name={'Test Text'}
                onChange={() => {}}
                value={retrievedItem[0].name}
              />
              <NumberInputField
                name={'Test Number'}
                onChange={() => {}}
                value={retrievedItem[0].id}
              />
              <DateInputField name={'Test Date'} onChange={() => {}} />
              <CheckboxField
                checked={retrievedItem[0].isFolder}
                name={'Test Checkbox'}
                onChange={() => {}}
              />
              <TextareaField
                name={'Test Area'}
                onChange={() => {}}
                value={retrievedItem[0].fullPath}
              />
            </div>
          </div>
        </aside>
      )}
    </>
  )
}

export default InspectorSidebar
