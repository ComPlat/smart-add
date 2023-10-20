'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { Button, message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface FileTree {
  [key: string]: Blob | FileTree
}

const FileDownloader = () => {
  const files = useLiveQuery(() => filesDB.files.toArray()) || []

  const constructTree = (files: ExtendedFile[]) => {
    const fileTree: FileTree = {}

    files.forEach((file) => {
      const pathComponents: string[] = file.path.split('/')
      let currentLevel = fileTree

      pathComponents.forEach((component, index) => {
        if (!currentLevel[component]) {
          currentLevel[component] = {}
        }

        if (index === pathComponents.length - 1) {
          currentLevel[component] = file.file
        } else {
          currentLevel = currentLevel[component] as FileTree
        }
      })
    })

    return fileTree
  }

  const handleClick = async () => {
    if (files.length === 0) {
      message.error('No files to download!')
      return
    }

    try {
      const zip = new JSZip()
      const fileTree = constructTree(files)

      const addFilesToZip = async (tree: FileTree, path: string) => {
        for (const [key, value] of Object.entries(tree)) {
          if (value instanceof Blob) {
            zip.file(`${path}/${key}`, value)
          } else {
            await addFilesToZip(value, `${path}/${key}`)
          }
        }
      }

      await addFilesToZip(fileTree, '')

      const topmostFolder = Object.keys(fileTree)[0]
      const blob = await zip.generateAsync({ type: 'blob' })

      saveAs(blob, `${topmostFolder}.zip`)
      message.success(`${topmostFolder}.zip downloaded successfully`)
    } catch (error) {
      console.error(error)
    }
  }

  const handleClear = () => {
    filesDB.files.clear()
    window.location.reload()
  }

  return (
    <div className="flex">
      <Button
        className="mx-2 w-1/2"
        disabled={files.length === 0 ? true : false}
        onClick={handleClick}
      >
        Download as Zip
      </Button>
      <Button
        className="mx-2 w-1/2"
        danger
        disabled={files.length === 0 ? true : false}
        onClick={handleClear}
      >
        Clear DB
      </Button>
    </div>
  )
}

export { FileDownloader }
