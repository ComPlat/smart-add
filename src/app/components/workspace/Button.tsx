import { ReactNode } from 'react'

type ButtonProps = {
  className?: string
  disabled?: boolean
  icon?: ReactNode
  label?: string
  onClick?: () => Promise<void> | void
  variant?: 'danger' | 'default'
}

const defaultStyle =
  'flex justify-center text-white gap-4 bg-black px-4 disabled:bg-slate-400 disabled:text-slate-200 disabled:shadow-none hover:bg-gray-700 duration-150 m-2 rounded-lg bg-kit-primary-full p-2'
const dangerStyle =
  'flex justify-center gap-4 text-white border border-solid px-4 disabled:bg-slate-400 disabled:text-slate-200 disabled:border-slate-200 disabled:shadow-none hover:bg-red-400 duration-150'

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
        : `${defaultStyle} ${className}`
    }
    disabled={disabled}
    onClick={onClick}
  >
    {icon}
    <div className="flex h-full items-center justify-center whitespace-nowrap text-sm font-semibold">
      {label}
    </div>
  </button>
)

export { Button }
