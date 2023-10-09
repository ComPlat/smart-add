import { Fragment } from 'react'

import { FileList } from './upload-form/FileList'
import ParseXlsx from './upload-form/ParseXlsx'
import { UploadDropZone } from './upload-form/UploadDropZone'

const UploadForm: React.FC = () => {
  return (
    <Fragment>
      <UploadDropZone />
      <FileList />
      <ParseXlsx />
    </Fragment>
  )
}

export { UploadForm }
