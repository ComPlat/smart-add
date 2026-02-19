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
  hideRenameOption = false,
}: {
  closeContextMenu: () => void
  targetItem: ExtendedFile | ExtendedFolder
  tree: Record<string, FileNode>
  hideDeleteOption?: boolean
  hideRenameOption?: boolean
}) => (
  <>
    {!hideRenameOption && (
      <RenameContextMenuItem
        close={closeContextMenu}
        item={targetItem}
        tree={tree}
      />
    )}
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
