type ProgressBarProps = {
  progress: number
  strokeWidth?: number
}

const ProgressBar = ({ progress, strokeWidth = 4 }: ProgressBarProps) => {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // TODO: Rotate me counterclockwise!
  // TODO: Animate the arrow depending on the progress as well.
  return (
    <svg className="h-12 w-12" viewBox="0 0 50 50">
      <circle
        className="text-gray-300"
        cx="50%"
        cy="50%"
        fill="transparent"
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <circle
        className="text-kit-primary-full"
        cx="50%"
        cy="50%"
        fill="transparent"
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        style={{ strokeDasharray: circumference, strokeDashoffset }}
      />
      <svg
        aria-hidden="true"
        className="text-kit-primary-full"
        fill="none"
        viewBox="0 0 21 30"
        x={9.6}
        xmlns="http://www.w3.org/2000/svg"
        y={13.5}
      >
        <path
          d="M5 13V1m0 0L1 5m4-4 4 4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth / 2}
        />
      </svg>
    </svg>
  )
}

export { ProgressBar }
