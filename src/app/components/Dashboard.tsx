'use client'

import { Content } from 'antd/es/layout/layout'

import Header from './dashboard/Header'
import Sider from './dashboard/Sider'

const Dashboard = () => {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex h-full">
        <Sider />
        <Content />
      </div>
    </div>
  )
}

export default Dashboard
