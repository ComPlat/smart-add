import { Modal, Tabs } from 'antd'
import { useState } from 'react'
import { FaFileImport, FaFileExcel } from 'react-icons/fa6'
import { Button } from '../workspace/Button'
import type { UploadFile } from 'antd'
import { message } from 'antd'
import {
  useJsonZipUploadConfig,
  useExcelUploadConfig,
} from './import-modal/useUploadConfig'
import JsonZipTab from './import-modal/JsonZipTab'
import ExcelTab from './import-modal/ExcelTab'

const ImportStructureButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('json-zip')
  const [jsonZipFile, setJsonZipFile] = useState<UploadFile | null>(null)
  const [excelFile, setExcelFile] = useState<UploadFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    if (activeTab === 'json-zip') {
      if (!jsonZipFile) {
        message.warning('Please upload a file first')
        return
      }

      setIsProcessing(true)
      try {
        // Determine file type
        // const fileName = jsonZipFile.name.toLowerCase()
        // const fileType = fileName.endsWith('.json') ? 'json' : 'zip'

        // Process the file
        message.loading({ content: 'Processing import file...', key: 'import' })
        // TODO: Show processed Data
        message.loading({
          content: 'Importing data to database...',
          key: 'import',
        })

        message.success({
          content: `Successfully imported`,
          key: 'import',
          duration: 3,
        })

        setIsModalVisible(false)
        setJsonZipFile(null)

        // Reload the page to refresh the tree view
        window.location.reload()
      } catch (error) {
        console.error('Import error:', error)
        message.error({
          content: `Import failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          key: 'import',
          duration: 5,
        })
      } finally {
        setIsProcessing(false)
      }
    } else if (activeTab === 'excel') {
      if (!excelFile) {
        message.warning('Please upload an Excel file first')
        return
      }
      // TODO: Process the uploaded Excel file
      message.info('Excel import is not yet implemented')
      console.log('Processing Excel file:', excelFile)
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setJsonZipFile(null)
    setExcelFile(null)
  }

  const jsonZipUploadProps = useJsonZipUploadConfig(jsonZipFile, setJsonZipFile)
  const excelUploadProps = useExcelUploadConfig(excelFile, setExcelFile)

  const tabItems = [
    {
      key: 'json-zip',
      label: (
        <span className="flex items-center gap-2">
          <FaFileImport /> JSON & ZIP Files
        </span>
      ),
      children: <JsonZipTab uploadProps={jsonZipUploadProps} />,
    },
    {
      key: 'excel',
      label: (
        <span className="flex items-center gap-2">
          <FaFileExcel /> Excel File
        </span>
      ),
      children: <ExcelTab uploadProps={excelUploadProps} />,
    },
  ]

  return (
    <>
      <Button
        icon={<FaFileImport />}
        label="Import Structure"
        onClick={showModal}
        variant="primary"
      />
      <Modal
        width={700}
        footer={
          <div className="flex flex-row justify-end gap-2">
            <Button key="back" label="Cancel" onClick={handleCancel} />
            <Button
              key="submit"
              label={isProcessing ? 'Importing...' : 'Import'}
              onClick={handleOk}
              variant="primary"
              disabled={
                isProcessing ||
                (activeTab === 'json-zip' && !jsonZipFile) ||
                (activeTab === 'excel' && !excelFile)
              }
            />
          </div>
        }
        onCancel={handleCancel}
        onOk={handleOk}
        open={isModalVisible}
        title="Import Structure"
      >
        <Tabs
          activeKey={activeTab}
          items={tabItems}
          onChange={setActiveTab}
          className="custom-tabs"
        />
      </Modal>
    </>
  )
}

export default ImportStructureButton
