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
    <div className="flex-1 flex-col bg-white px-2 shadow-sm">{children}</div>
  </div>
)

export { UploadedFiles }
