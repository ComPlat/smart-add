import { Button } from './Button'
import { MenuItem } from './MenuItem'
import { Message } from './Message'

const Sidebar = () => {
  return (
    <aside className="flex w-[18%] flex-col items-stretch max-md:ml-0 max-md:w-full">
      <div className="mx-auto flex w-full flex-col items-center justify-between self-stretch rounded-3xl bg-white px-2 py-6 shadow-sm max-md:mt-4">
        <MenuItem label="Workspace" />
        <div className="mt-[712px] flex flex-col items-stretch justify-end self-stretch max-md:mt-10">
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
