import { Badge, Popover } from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { FaRegBell } from 'react-icons/fa6'
import chemotionLogo from '../../../../public/Chemotion_full.svg'
// import logo from '../../../../public/smartadd.png'
// import smartAdd1 from '../../../../public/smarAdd1.png'
// import smartAdd2 from '../../../../public/smartAdd2.png'
import smartAdd3 from '../../../../public/smartAdd3.png'
import smartAdd4 from '../../../../public/smartAdd4.png'

const Header = () => {
  const [open, setOpen] = useState(false)

  const hide = () => {
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <header className="flex w-full flex-row justify-between bg-white px-4 py-2 shadow-sm">
      <Link href="https://chemotion.net/" className="self-center">
        <Image
          alt="Chemotion Logo"
          className="self-center"
          height={50}
          priority
          src={chemotionLogo}
        />
      </Link>
      <Image
        alt="SmartAdd Logo"
        className="self-center"
        height={100}
        width={100}
        priority
        src={smartAdd4}
      />
      <Popover
        content={<a onClick={hide}>Close</a>}
        onOpenChange={handleOpenChange}
        open={open}
        placement="bottomLeft"
        title="Notifications"
        trigger="click"
      >
        <button className="flex gap-2">
          <Badge className="self-center" count={0} dot>
            <FaRegBell size={20} />
          </Badge>
        </button>
      </Popover>
    </header>
  )
}

export default Header
