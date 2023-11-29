import { Button } from './Button'
import { PlusIcon } from './icons/PlusIcon'

const ButtonGroup = () => (
  <div className="flex w-auto gap-5">
    <Button
      icon={<PlusIcon className="h-4 w-4 self-center text-white" />}
      label="Add Sample"
    />
    <Button
      icon={<PlusIcon className="h-4 w-4 self-center text-white" />}
      label="Add Reaction"
    />
  </div>
)

export { ButtonGroup }
