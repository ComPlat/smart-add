import { ExtendedFile, filesDB } from '@/database/db'
import { DeleteOutlined } from '@ant-design/icons'

const handleDelete = (file: ExtendedFile, event: React.MouseEvent) => {
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
}

const DeleteFileButton = ({ file }: { file: ExtendedFile }) => (
  <button
    className="rounded-sm px-0.5 text-neutral-400 transition-all hover:border-neutral-200 hover:bg-neutral-200 hover:text-neutral-900"
    onClick={(event) => handleDelete(file, event)}
  >
    <DeleteOutlined />
  </button>
)

export { DeleteFileButton }
