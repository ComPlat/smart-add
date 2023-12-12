'use client'

import { TreeView } from '../components/workspace/TreeView'
import Header from './workspace/Header'
import { Toolbar } from './workspace/Toolbar'

const Workspace = () => (
  <div className="flex flex-col bg-gray-100">
    <Header />
    <Toolbar />
    <div className="h-screen">
      <div className="flex h-full">
        <TreeView />
      </div>
      T
    </div>
  </div>
)

export default Workspace
