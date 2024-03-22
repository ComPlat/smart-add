import * as XLSX from 'xlsx'

const readSpreadsheet = (file: File) => {
  return new Promise<Record<string, object[]>>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result
      if (!arrayBuffer) return reject(new Error('Not a valid spreadsheet file'))

      const workbook = XLSX.read(arrayBuffer, { type: 'binary' })
      const worksheets = workbook.Sheets

      const worksheetData = {} as Record<string, object[][]>

      Object.keys(worksheets).forEach((name) => {
        const worksheet = worksheets[name]
        worksheetData[name] = XLSX.utils.sheet_to_json(worksheet)
      })

      resolve(worksheetData)
    }
    reader.readAsArrayBuffer(file)
  })
}

export { readSpreadsheet }
