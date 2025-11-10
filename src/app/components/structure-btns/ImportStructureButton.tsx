import { Modal, Tabs } from 'antd'
import { useState } from 'react'
import { FaFileImport, FaFileExcel } from 'react-icons/fa6'
import { Button } from '../workspace/Button'
import type { UploadFile } from 'antd'
import {
  useJsonZipUploadConfig,
  useExcelUploadConfig,
} from './import-modal/useUploadConfig'
import JsonZipTab from './import-modal/JsonZipTab'
import ExcelTab from './import-modal/ExcelTab'
import { dragNotifications } from '@/utils/dragNotifications'

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
        dragNotifications.showWarning('Please upload a file first')
        return
      }

      setIsProcessing(true)
      try {
        const fileName = jsonZipFile.name.toLowerCase()
        const isZip = fileName.endsWith('.zip')
        const isJson = fileName.endsWith('.json')

        if (!isZip && !isJson) {
          throw new Error('Please upload a valid JSON or ZIP file')
        }

        // Process the file
        dragNotifications.showWarning('Processing import file...')

        const file = jsonZipFile.originFileObj as File

        dragNotifications.showWarning('Importing data to database...')

        const { importFromJsonOrZip } = await import('@/helper/importFromZip')
        const result = await importFromJsonOrZip(file)
        dragNotifications.showSuccess(result.message)

        setIsModalVisible(false)
        setJsonZipFile(null)

        // Note: No need to reload - useLiveQuery in Workspace will automatically
        // detect the database changes and update the tree view reactively
      } catch (error) {
        console.error('Import error:', error)
        dragNotifications.showError(
          `Import failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        )
      } finally {
        setIsProcessing(false)
      }
    } else if (activeTab === 'excel') {
      if (!excelFile) {
        dragNotifications.showWarning('Please upload an Excel file first')
        return
      }
      // TODO: Process the uploaded Excel file
      dragNotifications.showWarning('Excel import is not yet implemented')
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
