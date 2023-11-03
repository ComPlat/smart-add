import { ReactElement } from 'react'
import {
  FaFolder,
  FaRegFileAlt,
  FaRegFileExcel,
  FaRegFileImage,
  FaRegFilePdf,
  FaRegFileWord,
  FaRegFolderOpen,
} from 'react-icons/fa'
import { GrDocumentZip } from 'react-icons/gr'

const ICONS: Readonly<Record<string, ReactElement>> = {
  docx: <FaRegFileWord />,
  folder: <FaFolder />,
  folderOpen: <FaRegFolderOpen />,
  jpeg: <FaRegFileImage />,
  jpg: <FaRegFileImage />,
  pdf: <FaRegFilePdf />,
  png: <FaRegFileImage />,
  txt: <FaRegFileAlt />,
  xlsx: <FaRegFileExcel />,
  xlx: <FaRegFileExcel />,
  zip: <GrDocumentZip />,
}

export { ICONS }
