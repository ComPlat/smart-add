import { ReactNode } from 'react'

const UploadedFiles = ({
  children,
  onContextMenu,
}: {
  children: ReactNode
  onContextMenu: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => Promise<void>
}) => (
  <div className="flex w-full flex-col" onContextMenu={onContextMenu}>
    <div className="relative h-full bg-white px-2 py-4 shadow-sm">
      {children}
    </div>
  </div>
)

export { UploadedFiles }
