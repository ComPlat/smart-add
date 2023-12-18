import { FileNode } from '@/helper/types'
import { Input, Modal } from 'antd'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa6'

import { Button } from '../workspace/Button'
import { getUniqueFolderName } from './folderUtils'
import { createReaction } from './templates'

const AddReaction = ({
  className,
  tree,
}: {
  className?: string
  tree: Record<string, FileNode>
}) => {
  const baseName = 'Reaction'
  const baseSampleName = 'Sample'

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [folderName, setFolderName] = useState(baseName)
  const [sampleName, setSampleName] = useState(baseSampleName)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    setIsModalVisible(false)
    const uniqueFolderName = getUniqueFolderName(folderName, tree, baseName)
    const uniqueSampleName = getUniqueFolderName(
      sampleName,
      tree,
      baseSampleName,
    )
    await createReaction(uniqueFolderName, tree, uniqueSampleName)
    setFolderName(baseName)
    setSampleName(baseSampleName)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setFolderName(baseName)
    setSampleName(baseSampleName)
  }

  return (
    <>
      <Button
        className={className}
        icon={<FaPlus />}
        label="Add Reaction"
        onClick={showModal}
      />
      <Modal
        footer={
          <div className="flex flex-row justify-end gap-2">
            <Button key="back" label="Cancel" onClick={handleCancel} />
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              key="submit"
              label="OK"
              onClick={handleOk}
              variant="primary"
            />
          </div>
        }
        onCancel={handleCancel}
        onOk={handleOk}
        open={isModalVisible}
        title="Enter Reaction and Sample Names"
      >
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="reactionName"
          >
            Reaction Name
          </label>
          <Input
            className="mt-1"
            id="reactionName"
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter reaction name"
            style={{ marginBottom: 8 }}
            value={folderName}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="sampleName"
          >
            Sample Name
          </label>
          <Input
            className="mt-1"
            id="sampleName"
            onChange={(e) => setSampleName(e.target.value)}
            placeholder="Enter sample name"
            value={sampleName}
          />
        </div>
      </Modal>
    </>
  )
}

export default AddReaction
