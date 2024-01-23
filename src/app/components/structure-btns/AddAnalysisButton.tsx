import { FileNode } from '@/helper/types'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa6'

import { Button } from '../workspace/Button'
import { getUniqueFolderName } from './folderUtils'
import { createAnalysis } from './templates'

const AddAnalysisButton = ({
  className,
  tree,
}: {
  className?: string
  tree: Record<string, FileNode>
}) => {
  const baseName = 'analysis'

  const [folderName, setFolderName] = useState(baseName)

  const handleOnClick = async () => {
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

export default AddAnalysisButton
