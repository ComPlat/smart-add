import { FileNode } from '@/helper/types'
import { Button, Input, Modal } from 'antd'
import { useState } from 'react'

import { createReaction } from './templates'

const AddReaction = ({
  className,
  tree,
}: {
  className: string
  tree: Record<string, FileNode>
}) => {
  const baseName = 'Reaction'
  const baseSampleName = 'Sample'

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [folderName, setFolderName] = useState(baseName)
  const [sampleName, setSampleName] = useState(baseSampleName) // New state for sample name

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    setIsModalVisible(false)
    if (folderName && sampleName) {
      await createReaction(folderName, tree, sampleName) // Pass sampleName as an argument
      setFolderName(baseName)
      setSampleName(baseSampleName) // Reset sample name
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setFolderName(baseName)
    setSampleName(baseSampleName) // Reset sample name
  }

  return (
    <>
      <Button className={className} onClick={showModal}>
        Add Structure
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
