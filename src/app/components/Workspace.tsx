'use client'

import { TreeView } from '../components/workspace/TreeView'
import Header from './workspace/Header'

const Workspace = () => (
  <div className="flex flex-col bg-gray-100 p-4">
    <Header />
    <div className="mt-4 h-screen">
      <div className="flex h-full">
        <TreeView />
      </div>
    </div>
  </div>
)

export default Workspace
