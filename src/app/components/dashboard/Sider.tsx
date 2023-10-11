import {
  HomeFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import { useState } from 'react'

import MenuItem from './MenuItem'

const Sider = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white py-4 shadow-xl`}>
      <MenuItem
        collapsed={collapsed}
        icon={<HomeFilled className="pl-8 text-kit-primary" />}
        label="Draft"
      />
      <Button
        style={{
          fontSize: '16px',
          height: 64,
          width: 64,
        }}
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        type="text"
      />
    </aside>
  )
}

export default Sider
