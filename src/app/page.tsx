'use client'

import Workspace from './components/Workspace'
import { ItemTitleContextProvider } from './components/contexts/ItemTitleContext'
import Header from './components/workspace/Header'

export default function App() {
  return (
    <main className="flex flex-col overflow-hidden bg-gray-100">
      <Header />
      <ItemTitleContextProvider>
        <Workspace />
      </ItemTitleContextProvider>
    </main>
  )
}
