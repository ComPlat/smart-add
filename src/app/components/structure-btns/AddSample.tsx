import { FileNode } from '@/helper/types'
import { Input, Modal } from 'antd'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa6'

import { Button } from '../workspace/Button'
import { getUniqueFolderName } from './folderUtils'
import { createSample } from './templates'

const AddSample = ({
  className,
  tree,
}: {
  className?: string
  tree: Record<string, FileNode>
}) => {
  const baseName = 'Sample'

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [folderName, setFolderName] = useState(baseName)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    setIsModalVisible(false)
    const uniqueFolderName = getUniqueFolderName(folderName, tree, baseName)
    await createSample(uniqueFolderName, tree)
    setFolderName(baseName)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setFolderName(baseName)
  }

  return (
    <>
      <Button
        className={className}
        icon={<FaPlus />}
        label="Add Sample"
        onClick={showModal}
      />
      <Modal
        footer={[
          <Button key="back" label="Cancel" onClick={handleCancel} />,
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            key="submit"
            label="OK"
            onClick={handleOk}
            variant="primary"
          />,
        ]}
        onCancel={handleCancel}
        onOk={handleOk}
        open={isModalVisible}
        title="Enter Sample Name"
      >
        <Input
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Sample name"
          value={folderName}
        />
      </Modal>
    </>
  )
}

export default AddSample
