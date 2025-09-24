import { ExtendedFile, ExtendedFolder } from '@/database/db'
import { FileNode } from '@/helper/types'

import ContextMenuDivider from './ContextMenuDivider'
import DeleteContextMenuItem from './context-menu-items/DeleteContextMenuItem'
import RenameContextMenuItem from './context-menu-items/RenameContextMenuItem'

const DefaultContextMenu = ({
  closeContextMenu,
  targetItem,
  tree,
  hideDeleteOption = false,
}: {
  closeContextMenu: () => void
  targetItem: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
  hideDeleteOption?: boolean
}) => (
  <>
    <RenameContextMenuItem
      close={closeContextMenu}
      item={targetItem}
      tree={tree}
    />
    <ContextMenuDivider />
    {!hideDeleteOption && (
      <DeleteContextMenuItem
        close={closeContextMenu}
        item={targetItem}
        tree={tree}
      />
    )}
  </>
)

export default DefaultContextMenu
