import { ReactNode } from 'react'

const ExportFiles = ({
  children,
  onContextMenu,
}: {
  children: ReactNode
  onContextMenu: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => Promise<void>
}) => (
  <div className="flex w-full grow flex-col" onContextMenu={onContextMenu}>
    <div className="relative h-full overflow-y-auto bg-white px-2 py-12 shadow-sm">
      {children}
    </div>
  </div>
)

export { ExportFiles }
