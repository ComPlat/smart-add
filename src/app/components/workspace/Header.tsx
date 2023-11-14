import { UserOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'
import Image from 'next/image'

import logo from '../../../../public/Logo_KIT.svg'

const Header = () => {
  return (
    <header className="z-20 flex h-20 place-items-center justify-between bg-white p-0 px-8 drop-shadow-md">
      <div className="flex place-items-center gap-8">
        <Image alt="logo" src={logo} width={100} />
        <h1 className="text-3xl font-bold">SmartAdd</h1>
      </div>
      <Avatar icon={<UserOutlined />} size="large" />
    </header>
  )
}

export default Header
