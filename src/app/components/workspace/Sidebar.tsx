import { FileDownloader } from '../zip-download/FileDownloader'
import { Message } from './Message'

const Sidebar = () => (
  <aside className="flex w-auto flex-col">
    <div className="flex h-full flex-col items-center justify-between rounded-3xl bg-white px-4 py-6 shadow-sm">
      <div className="mx-2 mt-4 flex flex-col gap-2">
        <Message
          key={`message-${Date.now()}`}
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

export default Sidebar
