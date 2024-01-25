import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'

import ContextMenuDivider from './ContextMenuDivider'
import DeleteContextMenuItem from './context-menu-items/DeleteContextMenuItem'
import RenameContextMenuItem from './context-menu-items/RenameContextMenuItem'

const DefaultContextMenu = ({
  closeContextMenu,
  targetItem,
  tree,
}: {
  closeContextMenu: () => void
  targetItem: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
}) => (
  <>
    <RenameContextMenuItem
      close={closeContextMenu}
      item={targetItem}
      tree={tree}
    />
    <ContextMenuDivider />
    <DeleteContextMenuItem
      close={closeContextMenu}
      item={targetItem}
      tree={tree}
    />
  </>
)

export default DefaultContextMenu
