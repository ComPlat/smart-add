import { Upload } from 'antd'
import type { UploadProps } from 'antd'
import { FaFileImport, FaFileZipper } from 'react-icons/fa6'

const { Dragger } = Upload

type JsonZipTabProps = {
  uploadProps: UploadProps
}

const JsonZipTab = ({ uploadProps }: JsonZipTabProps) => {
  return (
    <div className="py-4">
      <div className="mb-4 rounded-lg bg-kit-primary-light p-4 border border-kit-primary-full/20">
        <div className="flex items-start gap-3">
          <div className="flex gap-2 text-kit-primary-full mt-1">
            <FaFileImport />
            <FaFileZipper />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              JSON or ZIP File
            </h4>
            <p className="text-sm text-gray-700">
              Upload either a JSON file or a ZIP file containing your structure
              data.{' '}
              <strong>
                The JSON format should follow either the ChemScanner JSON
                structure or the SmartAdd export.json format.
              </strong>
            </p>
          </div>
        </div>
      </div>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <div className="flex justify-center gap-4 text-4xl">
            <FaFileImport className="text-kit-primary-full" />
            <FaFileZipper className="text-kit-primary-full" />
          </div>
        </p>
        <p className="ant-upload-text font-semibold">
          Click or drag JSON or ZIP file to this area to upload
        </p>
        <p className="ant-upload-hint text-gray-500">
          Upload a single .json or .zip file. Maximum file size: 50MB
        </p>
      </Dragger>
    </div>
  )
}

export default JsonZipTab
