type ArchiveIconProps = {
  className?: string
  hidden?: boolean
  type?: 'outlined' | 'solid'
  viewBox?: string
}

const ArchiveIcon = ({
  className,
  hidden = true,
  type = 'solid',
  viewBox = '0 0 20 16',
}: ArchiveIconProps) => {
  if (type === 'outlined') {
    return (
      <svg
        aria-hidden={hidden}
        className={className}
        fill="none"
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 8v1h4V8m4 7H4a1 1 0 0 1-1-1V5h14v9a1 1 0 0 1-1 1ZM2 1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    )
  } else if (type === 'solid') {
    return (
      <svg
        aria-hidden={hidden}
        className={className}
        fill="currentColor"
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M19 0H1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1ZM2 6v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6H2Zm11 3a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0h2a1 1 0 0 1 2 0v1Z" />
      </svg>
    )
  }
}

export { ArchiveIcon }
