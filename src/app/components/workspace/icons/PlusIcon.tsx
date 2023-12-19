import { IconProps } from '@/types/IconProps'

const PlusIcon = ({
  className,
  hidden = true,
  viewBox = '0 0 18 18',
}: IconProps) => (
  <svg
    aria-hidden={hidden}
    className={className}
    fill="none"
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 1v16M1 9h16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

export { PlusIcon }
