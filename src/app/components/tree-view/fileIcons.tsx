import { ReactElement } from 'react'
import {
  FaFileZipper,
  FaRegFile,
  FaRegFileCode,
  FaRegFileExcel,
  FaRegFileImage,
  FaRegFileLines,
  FaRegFilePdf,
  FaRegFileWord,
  FaRegFileZipper,
} from 'react-icons/fa6'
import { MdFolder, MdFolderOpen } from 'react-icons/md'
import { PiFileSvgBold } from 'react-icons/pi'
import { VscListTree } from 'react-icons/vsc'

const ICONS: Readonly<Record<string, ReactElement>> = {
  docx: <FaRegFileWord />,
  file: <FaRegFile />,
  folder: <MdFolder />,
  folderOpen: <MdFolderOpen />,
  jpeg: <FaRegFileImage />,
  jpg: <FaRegFileImage />,
  json: <FaRegFileCode />,
  pdf: <FaRegFilePdf />,
  png: <FaRegFileImage />,
  root: <VscListTree />,
  svg: <PiFileSvgBold />,
  txt: <FaRegFileLines />,
  xlsx: <FaRegFileExcel />,
  xlx: <FaRegFileExcel />,
  zip: <FaFileZipper />,
  zipOpen: <FaRegFileZipper />,
}

export { ICONS }
