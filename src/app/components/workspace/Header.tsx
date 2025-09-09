import Image from 'next/image'
import Link from 'next/link'
import chemotionLogo from '../../../../public/Chemotion_full.svg'
import logo from '../../../../public/logo.png'
import { Badge, Popover } from 'antd'
import { useState } from 'react'
import { FcSettings } from 'react-icons/fc'

const Header = () => {
  const [open, setOpen] = useState(false)

  const hide = () => {
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }
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
      <Popover
        content={
          <div className="flex flex-col gap-2 w-48">
            <Link
              href="/docs"
              target="_blank"
              className="rounded !bg-gray-600 px-3 py-2 text-sm !text-white duration-150 hover:!bg-gray-800 text-left block"
              onClick={() => {
                hide()
              }}
            >
              Documentation
            </Link>
            <button
              className="rounded bg-kit-primary-full px-3 py-2 text-sm text-white duration-150 hover:bg-kit-primary-full/90 text-left"
              onClick={() => {
                window.open('https://forms.gle/op4TQ3aP3XGYkhpCA', '_blank')
                hide()
              }}
            >
              Write Feedback
            </button>
          </div>
        }
        onOpenChange={handleOpenChange}
        open={open}
        placement="bottomLeft"
        title="Actions"
        trigger="click"
      >
        <button className="flex gap-2">
          <Badge className="self-center" count={0} dot>
            <FcSettings size={24} />
          </Badge>
        </button>
      </Popover>
    </header>
  )
}

export default Header
