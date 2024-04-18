'use client'

import { useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'

import InspectorSidebar from './components/InspectorSidebar'
import Workspace from './components/Workspace'
import Header from './components/workspace/Header'

export default function App() {
  const [focusedItem, setFocusedItem] = useState<
    TreeItemIndex & (TreeItemIndex | TreeItemIndex[])
  >()

  return (
    <main className="flex h-screen bg-gray-100">
      <div className="flex h-full w-full flex-col">
        <Header />
        <Workspace focusedItem={focusedItem} setFocusedItem={setFocusedItem} />
      </div>
      <InspectorSidebar focusedItem={focusedItem} />
    </main>
  )
}
