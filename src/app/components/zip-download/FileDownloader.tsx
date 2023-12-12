'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { message } from 'antd'
import { useLiveQuery } from 'dexie-react-hooks'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

import { Button } from '../workspace/Button'
import { ArchiveDownloadIcon } from '../workspace/icons/ArchiveDownloadIcon'

interface FileTree {
  [key: string]: Blob | FileTree
}

const FileDownloader = () => {
  const files = useLiveQuery(() => filesDB.files.toArray()) || []

  const constructTree = (files: ExtendedFile[]): FileTree =>
    files.reduce((fileTree, file) => {
      const pathComponents: string[] = file.fullPath.split('/')
      pathComponents.reduce(
        (level: FileTree, component: string, index: number) => {
          if (!level[component]) {
            level[component] = {}
          }
          if (index === pathComponents.length - 1) {
            level[component] = file.file
          }
          return level[component] as FileTree
        },
        fileTree,
      )

      return fileTree
    }, {} as FileTree)

  const handleClick = async () => {
    if (files.length === 0) {
      message.error('No files to download!')
      return
    }

    try {
      const zip = new JSZip()
      const fileTree = constructTree(files)

      const addFilesToZip = async (
        tree: FileTree,
        path: string,
      ): Promise<JSZip[]> => {
        const promises: Promise<JSZip[]>[] = Object.keys(tree).map(
          async (key) => {
            const value = tree[key]
            const newPath = path ? `${path}/${key}` : key

            return value instanceof Blob
              ? [zip.file(newPath, value)]
              : await addFilesToZip(value, newPath)
          },
        )

        const results = await Promise.all(promises)

        return results.flat()
      }

      await addFilesToZip(fileTree, '')

      const blob = await zip.generateAsync({ type: 'blob' })

      saveAs(blob, 'exportZip')
      message.success('exportZip.zip downloaded successfully')
    } catch (error) {
      console.error(error)
    }
  }

  const handleClear = () => {
    filesDB.files.clear()
    window.location.reload()
  }

  return (
    <div className="flex gap-5">
      <Button
        icon={
          <ArchiveDownloadIcon className="h-4 w-4 self-center text-white" />
        }
        disabled={files.length === 0 ? true : false}
        label="Export as ZIP"
        onClick={handleClick}
      />

      <Button
        disabled={files.length === 0 ? true : false}
        label="Clear DB"
        onClick={handleClear}
        variant="danger"
      ></Button>
    </div>
  )
}

export { FileDownloader }
