import Image from 'next/image'
import Link from 'next/link'
import chemotionLogo from '../../../../public/Chemotion_full.svg'
import logo from '../../../../public/logo.png'

const Header = () => {
  return (
    <header className="flex w-full flex-row justify-between bg-white px-4 py-2 shadow-sm">
      <Link href="https://chemotion.net/" className="self-center">
        <Image alt="Chemotion Logo" src={chemotionLogo} />
      </Link>
      <Image
        alt="SmartAdd Logo"
        className="self-center"
        width={100}
        src={logo}
      />
      <button
        className="self-center rounded bg-kit-primary-full px-2 py-1 text-sm text-white duration-150 hover:bg-kit-primary-full/90"
        onClick={() =>
          window.open(
            'https://docs.google.com/forms/d/e/1FAIpQLSe84-hT72jy6ZEeHYPl5WC8WmrnWDV-0RaBwYmrWTwcYsZs2w/viewform?usp=sharing&ouid=100466825347759062327',
          )
        }
      >
        Write Feedback
      </button>
    </header>
  )
}

export default Header
