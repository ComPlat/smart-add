import { Spin } from 'antd'

const UploadSpinner = ({ isUploading }: { isUploading: boolean }) => (
  <>
    {isUploading && (
      <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
        <Spin size="large" />
      </div>
    )}
  </>
)

export { UploadSpinner }
