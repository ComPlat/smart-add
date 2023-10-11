import { ReactNode } from 'react'

type MenuItemProps = {
  collapsed: boolean
  icon: ReactNode
  label: string
}

const MenuItem = (props: MenuItemProps) => {
  return (
    <div className="flex h-10 place-items-center border-r-4 border-kit-primary bg-kit-primary/10 text-sm transition-all duration-100 hover:bg-kit-primary/20">
      {props.icon}
      {props.collapsed ? undefined : (
        <p className="pl-4 text-kit-primary">{props.label}</p>
      )}
    </div>
  )
}

export default MenuItem
