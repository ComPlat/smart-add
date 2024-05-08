const DropDownMenu = () => {
  return (
    <select
      className={`mt-2 rounded border bg-white px-2 py-1
        text-sm outline-gray-200
        hover:border-kit-primary-full focus:border-kit-primary-full`}
      name="reaction-scheme-type"
    >
      <option value="none">None</option>
      <optgroup label="Reaction scheme type">
        <option value="starting-material">Starting material</option>
        <option value="reactant">Reactant</option>
        <option value="product">Product</option>
      </optgroup>
    </select>
  )
}

export default DropDownMenu
