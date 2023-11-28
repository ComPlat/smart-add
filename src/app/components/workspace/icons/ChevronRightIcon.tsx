import { IconProps } from '@/types/IconProps'

const ChevronRightIcon = ({
  className,
  hidden = true,
  viewBox = '0 0 6 10',
}: IconProps) => (
  <svg
    aria-hidden={hidden}
    className={className}
    fill="none"
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m1 9 4-4-4-4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

export { ChevronRightIcon }
