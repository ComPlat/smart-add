'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { Button } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface TreeStructure {
  [key: string]: TreeStructure | string
}

const FileDownloader = () => {
  const files = useLiveQuery(() => filesDB.files.toArray()) || []

  // TODO: Tree structure needs to include file objects.
  //       Extracted files cannot be opened as of now.
  const constructTree = (files: ExtendedFile[]): TreeStructure => {
    const fileTree: TreeStructure = {}

    files.forEach((file) => {
      const pathComponents: string[] = file.path.split('/')
      let currentLevel: TreeStructure = fileTree

      pathComponents.forEach((component, index) => {
        if (!currentLevel[component]) {
          currentLevel[component] = {}
        }

        if (index === pathComponents.length - 1) {
          currentLevel[component] = file.name
        } else {
          currentLevel = currentLevel[component] as TreeStructure
        }
      })
    })

    console.log(fileTree)
    return fileTree
  }

  const handleClick = async () => {
    const zip = new JSZip()
    const fileTree = constructTree(files)

    async function addFilesToZip(tree: TreeStructure, path: string) {
      for (const [key, value] of Object.entries(tree)) {
        if (typeof value === 'string') {
          const fileContent = JSON.stringify(value)
          const blob = new Blob([fileContent], { type: 'text/plain' })
          const file = new File([blob], `${path}/${key}`)
          zip.file(`${path}/${key}`, file)
        } else {
          await addFilesToZip(value, `${path}/${key}`)
        }
      }
    }

    await addFilesToZip(fileTree, '')

    const topmostFolder = Object.keys(fileTree)[0]
    const blob = await zip.generateAsync({ type: 'blob' })

    saveAs(blob, `${topmostFolder}.zip`)
  }

  return <Button onClick={handleClick}>Download as Zip</Button>
}

export { FileDownloader }
