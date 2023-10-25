import { Fragment } from 'react'

// import { FileList } from './upload-form/FileList'
import ParseXlsx from './upload-form/ParseXlsx'
import { TreeView } from './upload-form/TreeView'
// import { TreeViewOld } from './upload-form/TreeViewOld'
import { UploadDropZone } from './upload-form/UploadDropZone'
import { FileDownloader } from './zip-download/ZipDownloader'

const UploadForm: React.FC = () => {
  return (
    <Fragment>
      <UploadDropZone />
      <FileDownloader />
      <TreeView />
      {/* <TreeViewOld /> */}
      <ParseXlsx />
      {/* <FileList /> */}
    </Fragment>
  )
}

export { UploadForm }
