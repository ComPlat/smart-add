type Button = {
  label: string
}

const Button = ({ label }: Button) => {
  return (
    <div className="mt-8 flex items-stretch justify-center gap-2 self-center rounded-lg border border-solid border-[color:var(--KIT-Accent-Color-full,#4678B2)] bg-kit-primary-full px-12 py-2.5 shadow-sm max-md:px-5">
      <div className="flex aspect-square flex-col items-stretch justify-center bg-white bg-opacity-0">
        <img
          className="aspect-square w-5 overflow-hidden object-contain object-center"
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/1c5a0a10-5d9a-429a-bc21-30ad0f3539f7?"
        />
      </div>
      <div className="whitespace-nowrap text-center text-sm font-semibold leading-5 text-white">
        {label}
      </div>
    </div>
  )
}

export { Button }
