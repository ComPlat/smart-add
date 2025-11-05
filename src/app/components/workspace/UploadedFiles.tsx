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
  <div className="flex w-1/2 flex-col" onContextMenu={onContextMenu}>
    <div className="relative h-full overflow-y-auto bg-white px-2 py-4 shadow-sm">
      {children}
    </div>
  </div>
)

export { UploadedFiles }
