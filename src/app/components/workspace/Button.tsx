import { ReactNode } from 'react'

type ButtonProps = {
  className?: string
  disabled?: boolean
  icon?: ReactNode
  key?: string
  label?: string
  onClick?: () => Promise<void> | void
  variant?: 'danger' | 'default' | 'primary'
}

const defaultStyle =
  'flex items-center justify-center text-kit-primary-full border border-kit-primary-full gap-2 disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none hover:bg-kit-primary-light/5 duration-150 m-2 rounded-lg bg-white p-2'
const primaryStyle =
  'flex items-center justify-center text-white gap-2 disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none hover:bg-gray-700 duration-150 m-2 rounded-lg bg-kit-primary-full p-2'
const dangerStyle =
  'flex items-center justify-center gap-4 text-white border border-solid px-4 disabled:bg-slate-400 disabled:text-slate-200 disabled:border-slate-200 disabled:shadow-none hover:bg-red-400 duration-150'

const Button = ({
  className,
  disabled = false,
  icon,
  key,
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
    key={key}
    onClick={onClick}
  >
    {icon}
    <div className="flex h-full items-center justify-center whitespace-nowrap text-sm">
      {label}
    </div>
  </button>
)

export { Button }
