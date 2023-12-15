import { Badge } from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import { FaRegBell } from 'react-icons/fa6'

import chemotionLogo from '../../../../public/Chemotion_full.svg'

const Header = () => (
  <header className="flex w-full flex-row justify-between bg-white px-4 py-2 shadow-sm">
    <Link href="https://chemotion.net/">
      <Image alt="Chemotion Logo" height={50} priority src={chemotionLogo} />
    </Link>
    <h1 className="self-center">SmartAdd</h1>
    <div className="flex gap-2">
      <Badge className="self-center" count={0} dot>
        <FaRegBell size={20} />
      </Badge>
    </div>
  </header>
)

export default Header
