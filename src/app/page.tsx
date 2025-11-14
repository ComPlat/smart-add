'use client'

import { useState } from 'react'
import { TreeItemIndex } from 'react-complex-tree'
import InspectorSidebar from './components/InspectorSidebar'
import Workspace from './components/Workspace'
import Header from './components/workspace/Header'

export default function App() {
  const [focusedItem, setFocusedItem] = useState<TreeItemIndex | undefined>()

  return (
    <main className="flex h-screen flex-col bg-gray-100">
      <Header />
      <Workspace focusedItem={focusedItem} setFocusedItem={setFocusedItem}>
        <InspectorSidebar
          focusedItem={focusedItem}
          setFocusedItem={setFocusedItem}
        />
      </Workspace>
    </main>
  )
}
