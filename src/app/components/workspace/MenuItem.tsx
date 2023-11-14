type MenuItem = {
  label: string
}

const MenuItem = ({ label }: MenuItem) => {
  return (
    <div className="flex w-[219px] items-stretch gap-4 rounded-lg bg-gray-700 py-4 pl-6 pr-20 max-md:px-5">
      <img
        className="aspect-square w-5 max-w-full shrink-0 overflow-hidden object-contain object-center"
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/69351018-6856-4560-9ee0-f6626587f79f?"
      />
      <div className="whitespace-nowrap text-sm font-bold leading-5 text-white">
        {label}
      </div>
    </div>
  )
}

export { MenuItem }
