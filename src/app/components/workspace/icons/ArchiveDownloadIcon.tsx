import { IconProps } from '@/types/IconProps'

const ArchiveDownloadIcon = ({
  className,
  hidden = true,
  viewBox = '0 0 18 15',
}: IconProps) => {
  return (
    <svg
      aria-hidden={hidden}
      className={className}
      fill="currentColor"
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6H1v7Zm5.293-3.707a1 1 0 0 1 1.414 0L8 9.586V8a1 1 0 0 1 2 0v1.586l.293-.293a1 1 0 0 1 1.414 1.414l-2 2a1 1 0 0 1-1.416 0l-2-2a1 1 0 0 1 .002-1.414ZM17 0H1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1Z" />
    </svg>
  )
}

export { ArchiveDownloadIcon }
