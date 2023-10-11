import { UserOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'

const Header = () => {
  return (
    <header className="flex h-20 place-items-center justify-between bg-white p-0 px-8 shadow-md">
      <div className="flex place-items-center gap-8">
        <p>Logo</p>
        <h1 className="text-3xl font-bold">SmartAdd</h1>
      </div>
      <Avatar icon={<UserOutlined />} size="large" />
    </header>
  )
}

export default Header
