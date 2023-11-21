import { FileDownloader } from '../zip-download/FileDownloader'
import { MenuItem } from './MenuItem'
import { Message } from './Message'

const Sidebar = () => {
  return (
    <aside className="flex w-auto flex-col">
      <div className="flex h-full flex-col items-center justify-between rounded-3xl bg-white px-4 py-6 shadow-sm">
        <MenuItem label="Workspace" />
        <div className="mx-2 mt-4 flex flex-col">
          <Message
            percent={75.0}
            sumSize={400}
            title="4 files uploading"
            uploadedSize={300}
          />

          <FileDownloader />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
