import { IconProps } from '@/types/IconProps'

const ImageIcon = ({
  className,
  hidden = true,
  viewBox = '0 0 20 18',
}: IconProps) => (
  <svg
    aria-hidden={hidden}
    className={className}
    fill="none"
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z"
      fill="currentColor"
    />
    <path
      d="M18 1H2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

export { ImageIcon }
