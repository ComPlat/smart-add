import { Fragment } from 'react'

import { FileList } from './upload-form/FileList'
import { UploadDropZone } from './upload-form/UploadDropZone'

const UploadForm: React.FC = () => {
  return (
    <Fragment>
      <UploadDropZone />
      <FileList />
    </Fragment>
  )
}

export { UploadForm }
