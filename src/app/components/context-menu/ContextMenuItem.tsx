import { ReactNode, RefObject } from 'react'

const ContextMenuContainer = ({
  children,
  contextMenuRef,
  x,
  y,
}: {
  children: ReactNode
  contextMenuRef: RefObject<HTMLDivElement | null>
  x: number
  y: number
}) => (
  <div
    className={
      'absolute z-30 animate-fade-in rounded-lg border border-gray-300 bg-white shadow-lg'
    }
    ref={contextMenuRef}
    style={{ left: `${x}px`, top: `${y}px` }}
  >
    <ul className="px-1 [&>li:hover]:bg-gray-300 [&>li]:my-1 [&>li]:cursor-pointer [&>li]:rounded [&>li]:px-2 [&>li]:py-1">
      {children}
    </ul>
  </div>
)

export default ContextMenuContainer
