const Contextmenu = () => {
  return (
    <div className="flex grow basis-[0%] flex-col items-stretch self-start bg-white shadow-sm">
      <div className="flex flex-col items-stretch">
        <div className="flex flex-col items-stretch">
          <div className="justify-center px-5 text-xs font-medium leading-5 text-black max-md:pl-2">
            Create new folder
          </div>
          <div className="justify-center px-5 text-xs font-medium leading-5 text-black max-md:pl-2">
            Rename
          </div>
        </div>
        <div className="justify-center border-t border-solid border-t-[color:var(--gray-300,#D1D5DB)] pl-9 pr-5 text-xs font-medium leading-5 text-black max-md:pl-2.5">
          Delete
        </div>
      </div>
    </div>
  )
}

export { Contextmenu }
