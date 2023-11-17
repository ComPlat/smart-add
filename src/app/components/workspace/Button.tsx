import { ReactNode } from 'react'

type ButtonProps = {
  icon: ReactNode
  label: string
}

const Button = ({ icon, label }: ButtonProps) => {
  return (
    <div className="mt-8 flex justify-center gap-4 rounded-lg border border-solid border-kit-primary-full bg-kit-primary-full px-4 py-2.5 shadow-sm">
      {icon}
      <div className="whitespace-nowrap text-center text-sm font-semibold leading-5 text-white">
        {label}
      </div>
    </div>
  )
}

export { Button }
