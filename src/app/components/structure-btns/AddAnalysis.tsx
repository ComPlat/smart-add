import { FileNode } from '@/helper/types'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa6'

import { useItemTitleContext } from '../contexts/ItemTitleContext'
import { Button } from '../workspace/Button'
import { getUniqueFolderName } from './folderUtils'
import { createAnalysis } from './templates'

const AddAnalysis = ({
  className,
  tree,
}: {
  className?: string
  tree: Record<string, FileNode>
}) => {
  const baseName = 'analysis'

  const [folderName, setFolderName] = useState(baseName)
  const { itemTitle } = useItemTitleContext()

  const handleOnClick = async () => {
    if (itemTitle.includes('Sample')) console.log('I am a Sample')
    if (itemTitle.includes('Reaction')) console.log('I am a Reaction')

    const uniqueFolderName = getUniqueFolderName(folderName, tree, baseName)
    await createAnalysis(uniqueFolderName, tree)
    setFolderName(baseName)
  }

  return (
    <>
      <Button
        className={className}
        icon={<FaPlus />}
        label="Add Analysis"
        onClick={handleOnClick}
      />
    </>
  )
}

export default AddAnalysis
