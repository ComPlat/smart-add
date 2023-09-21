import { ExtendedFile, filesDB } from '@/database/db'
import { DeleteOutlined } from '@ant-design/icons'

const DeleteFileButton = ({ file }: { file: ExtendedFile }) => (
  <button
    onClick={(event) => {
      event.preventDefault()

      if (!('id' in file)) {
        throw new TypeError('Can not delete because the file is missing an id!')
      }

      if (!(typeof file.id === 'number')) {
        throw new TypeError(
          'Can not delete because the id of file is not a number!',
        )
      }

      filesDB.files.delete(file.id)
    }}
    className="rounded-sm px-0.5 text-neutral-400 transition-all hover:border-neutral-200 hover:bg-neutral-200 hover:text-neutral-900"
  >
    <DeleteOutlined />
  </button>
)

export { DeleteFileButton }
