import { FileNode } from '@/helper/types'
import { Button, Input, Modal } from 'antd'
import React, { useState } from 'react'

import { getUniqueFolderName } from './folderUtils'
import { createSample } from './templates'

const AddSample = ({
  className,
  tree,
}: {
  className: string
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
    const uniqueFolderName = folderName
      ? getUniqueFolderName(folderName, tree)
      : baseName
    await createSample(uniqueFolderName, tree)
    setFolderName(baseName)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setFolderName(baseName)
  }

  return (
    <>
      <Button className={className} onClick={showModal}>
        Add Sample
      </Button>
      <Modal
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            className="bg-blue-500 text-white hover:bg-blue-600"
            key="submit"
            onClick={handleOk}
            type="primary"
          >
            OK
          </Button>,
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
