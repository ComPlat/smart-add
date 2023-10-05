'use client'

import { ExtendedFile, filesDB } from '@/database/db'
import { useState } from 'react'
import * as XLSX from 'xlsx'

const ParseXlsx = () => {
  const [path, setPath] = useState('')
  const [output, setOutput] = useState('')

  const handleFileChange = async () => {
    const file: ExtendedFile | undefined = await filesDB.files.get({ path })
    if (!file) return

    const fileAsFile = new File([file.file], file.name, {
      type: file.file.type,
    })

    const reader = new FileReader()

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result
      const workbook = XLSX.read(arrayBuffer, { type: 'binary' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      setOutput(JSON.stringify(jsonData, null, 4))
    }

    reader.readAsArrayBuffer(fileAsFile)
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        className="w-full rounded-md border border-gray-300 p-4"
        onChange={(e) => setPath(e.target.value)}
        placeholder="Enter file path"
        type="text"
        value={path}
      />
      <button
        className="rounded-md bg-black p-4 text-white hover:bg-gray-700"
        onClick={handleFileChange}
      >
        Parse XLSX
      </button>
      {output && (
        <div>
          <h2>Output</h2>
          <pre className="overflow-x-auto rounded-md border border-gray-300 p-4">
            {output}
          </pre>
        </div>
      )}
      {!output && <p>No output to display!</p>}
    </div>
  )
}

export default ParseXlsx
