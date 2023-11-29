'use client'

import { TreeView } from '../components/workspace/TreeView'
import Header from './workspace/Header'
import Sidebar from './workspace/Sidebar'

const Workspace = () => (
  <div className="flex h-screen w-screen flex-col bg-gray-100 p-4">
    <Header />
    <div className="mt-4 h-screen">
      <div className="flex h-full overflow-hidden">
        <Sidebar />
        <TreeView />
      </div>
    </div>
  </div>
)

export default Workspace
