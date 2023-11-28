const ContextMenu = () => {
  return (
    <div className="flex grow basis-[0%] flex-col self-start bg-white shadow-sm">
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div className="justify-center px-5 text-xs font-medium leading-5 text-black">
            Create new folder
          </div>
          <div className="justify-center px-5 text-xs font-medium leading-5 text-black">
            Rename
          </div>
        </div>
        <div className="justify-center border-t border-solid border-t-gray-300 pl-9 pr-5 text-xs font-medium leading-5 text-black">
          Delete
        </div>
      </div>
    </div>
  )
}

export { ContextMenu }
