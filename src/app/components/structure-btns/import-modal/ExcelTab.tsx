import { Upload } from 'antd'
import type { UploadProps } from 'antd'
import { FaDownload, FaFileExcel } from 'react-icons/fa6'
import { dragNotifications } from '@/utils/dragNotifications'

const { Dragger } = Upload

type ExcelTabProps = {
  uploadProps: UploadProps
}

const ExcelTab = ({ uploadProps }: ExcelTabProps) => {
  const handleDownloadTemplate = () => {
    // TODO: Implement template download
    dragNotifications.showWarning(
      'Excel template download will be available soon',
    )
  }
  return (
    <div className="py-4">
      <div className="mb-4 rounded-lg bg-kit-primary-light p-4 border border-kit-primary-full/20">
        <div className="flex items-start gap-3">
          <FaDownload className="text-kit-primary-full mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              Download Template First
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Download the Excel template to ensure your data is formatted
              correctly
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-kit-primary-full text-white rounded-md hover:bg-kit-primary-full/90 transition-colors text-sm font-medium"
            >
              Download Template
            </button>
          </div>
        </div>
      </div>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <FaFileExcel className="mx-auto text-4xl text-kit-primary-full" />
        </p>
        <p className="ant-upload-text font-semibold">
          Click or drag Excel file to this area to upload
        </p>
        <p className="ant-upload-hint text-gray-500">
          Upload .xlsx or .xls file. Use the template above for correct
          formatting. Maximum file size: 50MB
        </p>
      </Dragger>
    </div>
  )
}

export default ExcelTab
