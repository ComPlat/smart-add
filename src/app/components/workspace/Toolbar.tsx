import { FaPlus } from 'react-icons/fa6'

import { FileDownloader } from '../zip-download/FileDownloader'
import { Button } from './Button'

const Toolbar = () => {
  return (
    <div className="flex justify-between">
      <div className="flex">
        <Button icon={<FaPlus />} label="Add Sample" />
        <Button icon={<FaPlus />} label="Add Reaction" />
      </div>
      <FileDownloader />
    </div>
  )
}

export { Toolbar }
