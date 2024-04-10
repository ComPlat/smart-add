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
  <div className="flex w-full flex-col" onContextMenu={onContextMenu}>
    <div className="flex grow flex-col">
      <div className="relative bg-white px-2 py-12 shadow-sm">{children}</div>
    </div>
  </div>
)

export { ExportFiles }
