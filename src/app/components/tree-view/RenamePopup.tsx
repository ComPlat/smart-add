import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { usePopupPosition } from '@/hooks/usePopupPosition'
import { FC, useRef } from 'react'
import RenameForm from '../shared/RenameForm'

interface RenamePopupProps {
  item: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
  x: number
  y: number
  onClose: () => void
}

const RenamePopup: FC<RenamePopupProps> = ({ item, tree, x, y, onClose }) => {
  const ref = useRef<HTMLDivElement>(null)
  const pos = usePopupPosition(ref, x, y)

  useOnClickOutside(ref, onClose)

  return (
    <div
      ref={ref}
      className="fixed z-50 rounded-lg border border-gray-300 bg-white p-2 shadow-lg"
      style={{ left: pos.left, top: pos.top }}
    >
      <RenameForm item={item} tree={tree} onDone={onClose} onCancel={onClose} />
    </div>
  )
}

export default RenamePopup
