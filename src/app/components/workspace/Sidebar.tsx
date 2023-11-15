import { Button } from './Button'
import { MenuItem } from './MenuItem'
import { Message } from './Message'

const Sidebar = () => {
  return (
    <aside className="flex w-auto flex-col">
      <div className="mx-auto flex h-screen w-full flex-col items-center justify-between rounded-3xl bg-white px-2 py-6 shadow-sm">
        <MenuItem label="Workspace" />
        <div className="mt-4 flex flex-col">
          <Message
            percent={75.0}
            sumSize={400}
            title="4 files uploading"
            uploadedSize={300}
          />
          <Button label="Export as ZIP" />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
