import { FileDownloader } from '../zip-download/FileDownloader'
import { Button } from './Button'
import { PlusIcon } from './icons/PlusIcon'

const ButtonGroup = () => (
  <div className="md: flex w-auto flex-col gap-5 md:flex-row">
    <Button
      icon={<PlusIcon className="h-4 w-4 self-center text-white" />}
      label="Add Sample"
    />
    <Button
      icon={<PlusIcon className="h-4 w-4 self-center text-white" />}
      label="Add Reaction"
    />
    <FileDownloader />
  </div>
)

export { ButtonGroup }
