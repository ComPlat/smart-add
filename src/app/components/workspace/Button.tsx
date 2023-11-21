import { ReactNode } from 'react'

type ButtonProps = {
  disabled?: boolean
  icon?: ReactNode
  label?: string
  onClick?: () => Promise<void> | void
  variant?: 'danger' | 'default'
}

const Button = ({
  disabled = false,
  icon,
  label,
  onClick,
  variant = 'default',
}: ButtonProps) => {
  const defaultStyle =
    'mt-8 flex justify-center text-white gap-4 rounded-lg border border-solid border-kit-primary-full bg-kit-primary-full px-4 py-2.5 shadow-sm disabled:bg-slate-400 disabled:text-slate-200 disabled:border-slate-200 disabled:shadow-none'
  const dangerStyle =
    'mt-8 flex justify-center gap-4 text-white rounded-lg border border-solid border-red-700 bg-red-500 px-4 py-2.5 shadow-sm disabled:bg-slate-400 disabled:text-slate-200 disabled:border-slate-200 disabled:shadow-none'

  return (
    <button
      className={variant === 'danger' ? dangerStyle : defaultStyle}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <div className="whitespace-nowrap text-center text-sm font-semibold leading-5">
        {label}
      </div>
    </button>
  )
}

export { Button }
