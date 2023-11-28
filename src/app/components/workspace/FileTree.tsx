import { FileData } from './FileData'

const FileTree = () => {
  // TODO: Create component for each file type (archive, spreadsheet, file, etc.)
  return (
    <div className="mb-0 mt-6 flex flex-col rounded-lg py-1">
      <FileData label="sample_ data_including3analyses.zip" type="archive" />
      <FileData label="2023_SmartAdd.mol" type="file" />
    </div>
  )
}

export { FileTree }
