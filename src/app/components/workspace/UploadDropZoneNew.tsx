const UploadDropZoneNew = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-20 py-8 max-md:max-w-full max-md:px-5">
      <img
        className="aspect-[1.33] w-16 max-w-full overflow-hidden object-contain object-center opacity-50"
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/01590c29-2d4c-4a4d-aa71-f07e085efda7?"
      />
      <div className="mt-4 flex flex-col items-stretch self-stretch">
        <div className="text-center text-base font-medium leading-6 text-black text-opacity-80">
          Drag your files or folders to this area to upload
        </div>
        <div className="mt-1 text-center text-sm leading-5 text-black text-opacity-50">
          None of the files will be uploaded to a server. Files will be saved in
          a browser database.
        </div>
      </div>
    </div>
  )
}

export { UploadDropZoneNew }
