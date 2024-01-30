import { ReactNode } from 'react'

type ButtonProps = {
  className?: string
  disabled?: boolean
  icon?: ReactNode
  key?: string
  label?: string
  onClick?: () => Promise<[void, void]> | Promise<void> | void
  variant?: 'danger' | 'default' | 'primary'
}

const defaultStyle = `flex items-center justify-center text-kit-primary-full 
border border-kit-primary-full gap-2 disabled:bg-slate-400 
disabled:text-slate-200 disabled:shadow-none hover:bg-kit-primary-light/5 
duration-150 rounded-lg bg-white p-2 min-w-[80px] text-sm`

const primaryStyle = `flex items-center justify-center text-white gap-2 border
disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none 
hover:bg-kit-primary-full/90 duration-150 rounded-lg bg-kit-primary-full p-2 
min-w-[80px] text-sm`

const dangerStyle = `flex items-center justify-center gap-2 text-white border 
disabled:bg-slate-400 disabled:text-slate-200 
disabled:border-slate-200 disabled:shadow-none hover:bg-red-400 bg-red-600 
duration-150 rounded-lg p-2 min-w-[80px] text-sm`

const Button = ({
  className,
  disabled = false,
  icon,
  label,
  onClick,
  variant = 'default',
}: ButtonProps) => (
  <button
    className={
      variant === 'danger'
        ? `${dangerStyle} ${className}`
        : variant === 'primary'
        ? `${primaryStyle} ${className}`
        : `${defaultStyle} ${className}`
    }
    disabled={disabled}
    name={label}
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
)

export { Button }
