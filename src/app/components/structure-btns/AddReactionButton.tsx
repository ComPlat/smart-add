import { FileNode } from '@/helper/types'
import { Input, Modal } from 'antd'
import { useState } from 'react'
import { FaPlus, FaDeleteLeft } from 'react-icons/fa6'
import { Button } from '../workspace/Button'
import { getUniqueFolderName } from './folderUtils'
import { createReaction } from './templates'
import SimpleReactionTypeDropdown from '../input-components/SimpleReactionTypeDropdown'
import { ReactionSchemeType } from '@/database/db'

const AddReactionButton = ({
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
  const [sampleNames, setSampleNames] = useState([baseSampleName])
  const [sampleTypes, setSampleTypes] = useState<ReactionSchemeType[]>([
    'product',
  ])

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    setIsModalVisible(false)
    const uniqueFolderName = getUniqueFolderName(
      folderName,
      tree,
      baseName,
      false,
      '',
    )
    // Create multiple samples with unique names
    for (const [index, sampleName] of sampleNames.entries()) {
      if (sampleName.trim()) {
        // Only create if name is not empty
        const uniqueSampleName = getUniqueFolderName(
          sampleName,
          tree,
          baseSampleName,
          false,
          uniqueFolderName,
        )
        await createReaction(
          uniqueFolderName,
          tree,
          uniqueSampleName,
          sampleTypes[index],
        )
      }
    }
    // Reset form
    setFolderName(baseName)
    setSampleNames([baseSampleName])
    setSampleTypes(['product'])
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setFolderName(baseName)
    setSampleNames([baseSampleName])
    setSampleTypes(['product'])
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
        <div className="mb-1">
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
          <div>
            {sampleNames.map((name, index) => (
              <div className="mb-1 flex items-end" key={index}>
                <div className="flex-col flex-1 mr-2">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="sampleName"
                  >
                    Sample Name
                  </label>
                  <Input
                    id={`sampleName-${index}`}
                    onChange={(e) => {
                      const newNames = [...sampleNames]
                      newNames[index] = e.target.value
                      setSampleNames(newNames)
                    }}
                    placeholder="Enter sample name"
                    value={name}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="sampleType"
                  >
                    Type
                  </label>
                  <SimpleReactionTypeDropdown
                    value={sampleTypes[index] || 'product'}
                    onChange={(value) => {
                      const newTypes = [...sampleTypes]
                      newTypes[index] = value
                      setSampleTypes(newTypes)
                    }}
                    className="!mt-0"
                  />
                </div>
                {index === 0 ? (
                  <Button
                    className="ml-2 p-0 w-8 h-8 flex items-center justify-center border-blue-500 hover:border-blue-700"
                    icon={<FaPlus size={15} />}
                    onClick={() => {
                      setSampleNames([...sampleNames, baseSampleName])
                      setSampleTypes([...sampleTypes, 'product'])
                    }}
                  />
                ) : (
                  <Button
                    className="ml-2 p-0 w-8 h-8 flex items-center justify-center border-red-500 hover:border-red-700"
                    icon={<FaDeleteLeft className="text-red-500" size={15} />}
                    onClick={() => {
                      const newNames = [...sampleNames]
                      const newTypes = [...sampleTypes]
                      newNames.splice(index, 1)
                      newTypes.splice(index, 1)
                      setSampleNames(newNames)
                      setSampleTypes(newTypes)
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AddReactionButton
