const FileTree = () => {
  // TODO: Create component for each file type (archive, spreadsheet, file, etc.)
  return (
    <div className="mb-0 mt-6 flex flex-col rounded-lg py-1 pr-20">
      <div className="flex w-auto items-stretch gap-2">
        <div className="flex items-center justify-between gap-2">
          <img
            className="my-auto aspect-square w-3 max-w-full shrink-0 overflow-hidden object-contain object-center"
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5f8802b-c640-4467-8b95-1eb449e4de77?"
          />
          <img
            className="aspect-square w-4 max-w-full shrink-0 self-stretch overflow-hidden object-contain object-center"
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/320a0315-dc1e-4caf-af24-b4537b641a4c?"
          />
        </div>
        <div className="truncate text-xs leading-5 text-gray-600">
          sample_ data_including3analyses.zip
        </div>
      </div>
      <div className="mt-3 flex w-[253px] max-w-full items-stretch gap-2 pl-5">
        <div className="flex aspect-[1.6875] flex-col items-stretch">
          <img
            className="aspect-[1.69] w-[27px] overflow-hidden object-contain object-center"
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/51783204-e128-4a48-9610-acc7725658e9?"
          />
        </div>
        <div className="truncate text-xs leading-5 text-gray-600">
          2023_SmartAdd.mol
        </div>
      </div>
    </div>
  )
}

export { FileTree }
