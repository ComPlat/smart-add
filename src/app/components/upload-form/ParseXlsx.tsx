'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { useState } from 'react'
import { JSONTree } from 'react-json-tree'
import * as XLSX from 'xlsx'

// TODO: Remove component when automatic processing of XLSX files is implemented
const ParseXlsx = () => {
  const [fullPath, setFullPath] = useState('')
  const [output, setOutput] = useState(null as XLSX.WorkBook | null)

  const handleFileChange = async () => {
    const file: ExtendedFile | undefined = await filesDB.files.get({ fullPath })
    if (!file) return

    const fileAsFile = new File([file.file], file.name, {
      type: file.file.type,
    })

    const reader = new FileReader()
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result
      const workbook = XLSX.read(arrayBuffer, { type: 'binary' })
      setOutput(workbook)
    }

    reader.readAsArrayBuffer(fileAsFile)
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        className="w-full rounded-md border border-gray-300 p-4"
        onChange={(e) => setFullPath(e.target.value)}
        placeholder="Enter file path"
        type="text"
        value={fullPath}
      />
      <div className="flex flex-row gap-4">
        <button
          className="flex-1 rounded-md bg-black p-4 text-white hover:bg-gray-700"
          onClick={handleFileChange}
        >
          Parse XLSX
        </button>
      </div>
      {output && (
        <div>
          <h2>Output</h2>
          <JSONTree data={output} />
        </div>
      )}
      {!output && <p>No output to display!</p>}
    </div>
  )
}

export default ParseXlsx
