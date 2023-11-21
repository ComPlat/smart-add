import { Fragment } from 'react'

import { TreeView } from './tree-view/TreeView'
import { FileList } from './upload-form/FileList'
import ParseXlsx from './upload-form/ParseXlsx'
import { UploadDropZone } from './upload-form/UploadDropZone'
import { FileDownloader } from './zip-download/FileDownloader'

const UploadForm: React.FC = () => {
  return (
    <Fragment>
      <UploadDropZone />
      <FileDownloader />
      <TreeView />
      <ParseXlsx />
      <FileList />
    </Fragment>
  )
}

export { UploadForm }
