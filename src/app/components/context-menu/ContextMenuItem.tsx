const ContextMenuItem = ({
  renderContextMenu,
}: {
  renderContextMenu: JSX.Element | null
}) => (
  <ul className="px-1 [&>li:hover]:bg-gray-300 [&>li]:my-1 [&>li]:cursor-pointer [&>li]:rounded [&>li]:px-2 [&>li]:py-1">
    {renderContextMenu}
  </ul>
)

export default ContextMenuItem
