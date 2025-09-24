import { ExtendedFolder, ReactionSchemeType, filesDB } from '@/database/db'
import { formatLabel } from '@/helper/utils'
import { useEffect, useState } from 'react'
import { ChevronDownIcon } from '../workspace/icons/ChevronDownIcon'

export type ReactionSchemeDropDownMenuProps = {
  item: ExtendedFolder
}

const ReactionSchemeDropDownMenu = ({
  item,
}: ReactionSchemeDropDownMenuProps) => {
  const [schemeType, setSchemeType] = useState<ReactionSchemeType>('none')

  useEffect(() => {
    if (!item) return

    const fullPath = item.fullPath

    const loadSchemeType = async () => {
      try {
        const dbItem = await filesDB.folders.get({ fullPath })
        if (!dbItem) return

        setSchemeType(dbItem.reactionSchemeType)
      } catch (error) {
        console.error(error)
      }
    }

    loadSchemeType()
  }, [item])

  const handleOnChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!item) return

    const fullPath = item.fullPath
    const value = e.target.value as ReactionSchemeType

    try {
      const dbItem = await filesDB.folders.get({ fullPath })

      if (!dbItem) return
      await filesDB.folders.where({ fullPath }).modify((folder) => {
        folder.reactionSchemeType = value
      })
      setSchemeType(value)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <label className="flex flex-col text-sm">
      <p className="font-bold">{formatLabel('type')}</p>
      <div className="relative mt-2">
        <select
          className="w-full appearance-none rounded border border-gray-300 bg-white px-2 py-1 pr-8 outline-gray-200
          hover:border-kit-primary-full focus:border-kit-primary-full"
          name="reaction-scheme-type"
          onChange={handleOnChange}
          value={schemeType}
        >
          <option value="none">None</option>
          <optgroup label="Type">
            <option value="startingMaterial">Starting material</option>
            <option value="reactant">Reactant</option>
            <option value="product">Product</option>
            <option value="solvent">Solvent</option>
          </optgroup>
        </select>
        <ChevronDownIcon className="w-2 h-2 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 flex-shrink-0" />
      </div>
    </label>
  )
}

export default ReactionSchemeDropDownMenu
