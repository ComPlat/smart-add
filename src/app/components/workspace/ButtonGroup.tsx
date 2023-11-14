const ButtonGroup = () => {
  return (
    <div className="ml-8 flex w-[317px] max-w-full items-stretch justify-between gap-5 max-md:ml-2.5">
      <div className="flex items-center justify-between gap-2 rounded-lg border border-solid border-[color:var(--KIT-Accent-Color-full,#4678B2)] bg-kit-primary-full px-4 py-2.5 shadow-sm">
        <div className="my-auto flex aspect-square flex-col items-stretch justify-center bg-white bg-opacity-0">
          <img
            className="aspect-square w-3.5 overflow-hidden object-contain object-center"
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/2dce0741-e7fb-48cb-8d3a-036fa486a558?"
          />
        </div>
        <div className="self-stretch whitespace-nowrap text-center text-sm font-semibold leading-5 text-white">
          Add Sample
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-solid border-[color:var(--KIT-Accent-Color-full,#4678B2)] bg-kit-primary-full px-4 py-2.5 shadow-sm">
        <div className="my-auto flex aspect-square flex-col items-stretch justify-center bg-white bg-opacity-0">
          <img
            className="aspect-square w-3.5 overflow-hidden object-contain object-center"
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/78ee640c-e4ed-4522-ad5c-31338308c83b?"
          />
        </div>
        <div className="self-stretch whitespace-nowrap text-center text-sm font-semibold leading-5 text-white">
          Add Reaction
        </div>
      </div>
    </div>
  )
}

export { ButtonGroup }
