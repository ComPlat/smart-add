import { FileDownloader } from '../zip-download/FileDownloader'
import { Button } from './Button'

const Toolbar = () => {
  return (
    <div className="flex justify-between">
      <div className="flex">
        <Button label="Add Sample" />
        <Button label="Add Reaction" />
      </div>
      <FileDownloader />
    </div>
  )
}

export { Toolbar }
