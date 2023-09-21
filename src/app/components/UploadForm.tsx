import { Fragment } from 'react'

import { UploadDropZone } from './upload-form/Dragger'
import { FileList } from './upload-form/FileList'

const UploadForm: React.FC = () => {
  return (
    <Fragment>
      <UploadDropZone />
      <FileList />
    </Fragment>
  )
}

export { UploadForm }
