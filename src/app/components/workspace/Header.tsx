import Image from 'next/image'
import Link from 'next/link'
import chemotionLogo from '../../../../public/Chemotion_full.svg'
import logo from '../../../../public/logo.png'

const Header = () => {
  return (
    <header className="flex w-full flex-row justify-between bg-white px-4 py-2 shadow-sm h-24 items-center">
      <Link href="https://chemotion.net/" className="self-center">
        <Image alt="Chemotion Logo" src={chemotionLogo} />
      </Link>
      <Image
        alt="SmartAdd Logo"
        className="self-center"
        width={100}
        src={logo}
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
