import type { UploadProps, UploadFile } from 'antd'
import { Upload } from 'antd'
import { dragNotifications } from '@/utils/dragNotifications'

export const useJsonZipUploadConfig = (
  jsonZipFile: UploadFile | null,
  setJsonZipFile: (file: UploadFile | null) => void,
): UploadProps => ({
  name: 'file',
  multiple: false,
  accept: '.json,.zip',
  fileList: jsonZipFile ? [jsonZipFile] : [],
  className: 'custom-upload-remove-icon',
  beforeUpload: (file) => {
    const fileName = file.name.toLowerCase()
    const isValidType = fileName.endsWith('.json') || fileName.endsWith('.zip')
    if (!isValidType) {
      dragNotifications.showError('Please upload only JSON or ZIP files')
      return Upload.LIST_IGNORE
    }
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      dragNotifications.showError('File must be smaller than 50MB')
      return Upload.LIST_IGNORE
    }
    return false // Prevent auto upload
  },
  onChange(info) {
    const latestFile = info.fileList[info.fileList.length - 1]
    setJsonZipFile(latestFile || null)
  },
  onRemove() {
    setJsonZipFile(null)
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files)
  },
})

export const useExcelUploadConfig = (
  excelFile: UploadFile | null,
  setExcelFile: (file: UploadFile | null) => void,
): UploadProps => ({
  name: 'file',
  multiple: false,
  accept: '.xlsx,.xls',
  fileList: excelFile ? [excelFile] : [],
  className: 'custom-upload-remove-icon',
  beforeUpload: (file) => {
    const fileName = file.name.toLowerCase()
    const isValidType = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
    if (!isValidType) {
      dragNotifications.showError('Please upload a valid Excel file')
      return Upload.LIST_IGNORE
    }
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      dragNotifications.showError('File must be smaller than 50MB')
      return Upload.LIST_IGNORE
    }
    return false // Prevent auto upload
  },
  onChange(info) {
    const latestFile = info.fileList[info.fileList.length - 1]
    setExcelFile(latestFile || null)
  },
  onRemove() {
    setExcelFile(null)
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files)
  },
})
