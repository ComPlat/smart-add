'use client'

import Content from './dashboard/Content'
import Header from './dashboard/Header'
import Sider from './dashboard/Sider'

const Dashboard = () => {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex h-full">
        <Sider />
        <Content>
          <div className="flex h-16 place-items-center justify-between shadow-md">
            <div className="ml-8 flex gap-8">
              <p>Icon</p>
              <p>There are 3 uploaded files in the database.</p>
            </div>
            <button className="mr-8 rounded-lg bg-kit-primary px-4 py-2 text-white shadow-lg">
              Go to workspace
            </button>
          </div>
        </Content>
      </div>
    </div>
  )
}

export default Dashboard
