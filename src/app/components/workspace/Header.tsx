import Image from 'next/image'
import Link from 'next/link'

const Header = () => {
  return (
    <header className="flex w-full flex-row justify-between bg-white px-4 py-2 shadow-sm h-24 items-center">
      <Link href="https://chemotion.net/" className="self-center">
        <Image
          alt="Chemotion Logo"
          width={100}
          height={60}
          src="/Chemotion_full.svg"
        />
      </Link>
      <Image
        alt="SmartAdd Logo"
        className="self-center"
        width={100}
        height={60}
        src="/logo.png"
      />
      <Link
        href="https://chemotion.net/docs/services/smartadd"
        className="rounded px-3 py-2 text-md font-medium text-kit-primary-full"
      >
        Documentation
      </Link>
    </header>
  )
}

export default Header
