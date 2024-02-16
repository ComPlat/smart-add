import { ExtendedFile, ExtendedFolder, filesDB } from '@/database/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'

const InputField = () => (
  <input
    autoFocus
    className="rounded border px-3 py-1 outline-gray-200 duration-100 hover:border-kit-primary-full focus:border-kit-primary-full"
    id="text-1"
    name="text-1"
    type="text"
  />
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
          } z-40 p-4 duration-300 ease-in-out`}
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
            <InputField />
            <InputField />
            <InputField />
            <InputField />
            <InputField />
          </div>
        </aside>
      )}
    </>
  )
}

export default InspectorSidebar
