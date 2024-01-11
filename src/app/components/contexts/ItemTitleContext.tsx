'use client'

import { ReactNode, createContext, useContext, useState } from 'react'

type ItemTitleContextProviderProps = {
  children: ReactNode
}

type ItemTitleContext = {
  itemTitle: string
  setItemTitle: React.Dispatch<React.SetStateAction<string>>
}

const ItemTitleContext = createContext<ItemTitleContext | undefined>(undefined)

const ItemTitleContextProvider = ({
  children,
}: ItemTitleContextProviderProps) => {
  const [itemTitle, setItemTitle] = useState('')

  return (
    <ItemTitleContext.Provider value={{ itemTitle, setItemTitle }}>
      {children}
    </ItemTitleContext.Provider>
  )
}

const useItemTitleContext = () => {
  const context = useContext(ItemTitleContext)

  if (!context) {
    throw new Error('useItemTitleContext must be used within ItemTitleProvider')
  }

  return context
}

export { ItemTitleContextProvider, useItemTitleContext }
