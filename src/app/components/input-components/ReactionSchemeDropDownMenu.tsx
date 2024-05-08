import { ExtendedFolder, ReactionSchemeType, filesDB } from '@/database/db'
import { formatLabel } from '@/helper/utils'
import { useState } from 'react'

export type ReactionSchemeDropDownMenuProps = {
  item: ExtendedFolder
}

const ReactionSchemeDropDownMenu = ({
  item,
}: ReactionSchemeDropDownMenuProps) => {
  const [schemeType, setSchemeType] = useState<ReactionSchemeType>('none')

  const handleOnChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!item || !item.fullPath) return

    const fullPath = item.fullPath

    setSchemeType(e.target.value as ReactionSchemeType)

    item.reactionSchemeType = schemeType

    try {
      const dbItem = await filesDB.folders.get({ fullPath })
      if (!dbItem) return

      await filesDB.folders.where({ fullPath }).modify({
        reactionSchemeType: schemeType,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel('Reaction scheme type')}</p>
      <select
        className="mt-2 rounded border bg-white px-2 py-1 outline-gray-200
        hover:border-kit-primary-full focus:border-kit-primary-full"
        name="reaction-scheme-type"
        onChange={handleOnChange}
      >
        <option value={schemeType}>None</option>
        <optgroup label="Reaction scheme type">
          <option value="starting-material">Starting material</option>
          <option value="reactant">Reactant</option>
          <option value="product">Product</option>
        </optgroup>
      </select>

      {JSON.stringify(item, null, 2)}
    </label>
  )
}

export default ReactionSchemeDropDownMenu
