import { ReactionSchemeType } from '@/database/db'
import { ChevronDownIcon } from '../workspace/icons/ChevronDownIcon'

interface SimpleReactionTypeDropdownProps {
  value: ReactionSchemeType
  onChange: (value: ReactionSchemeType) => void
  className?: string
}

const SimpleReactionTypeDropdown = ({
  value,
  onChange,
  className = '',
}: SimpleReactionTypeDropdownProps) => {
  return (
    <div className={`relative mt-2 ${className}`}>
      <select
        className="w-full appearance-none rounded border border-gray-300 bg-white px-2 py-1 pr-8 outline-gray-200
        hover:border-kit-primary-full focus:border-kit-primary-full"
        name="sample-type"
        value={value}
        onChange={(e) => onChange(e.target.value as ReactionSchemeType)}
      >
        <optgroup label="Type">
          <option value="startingMaterial">Starting material</option>
          <option value="reactant">Reactant</option>
          <option value="product">Product</option>
          <option value="solvent">Solvent</option>
        </optgroup>
      </select>
      <ChevronDownIcon className="w-2 h-2 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 flex-shrink-0" />
    </div>
  )
}

export default SimpleReactionTypeDropdown
