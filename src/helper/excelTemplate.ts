import * as XLSX from 'xlsx'

/**
 * Generates an Excel template for importing structures
 * Returns a Blob that can be downloaded
 */
export const generateExcelTemplate = (): Blob => {
  // Create a new workbook
  const wb = XLSX.utils.book_new()

  // Sheet 1: Samples
  const samplesData = [
    [
      'identifier',
      'parent',
      'name',
      'external_label',
      'role',
      'equivalent',
      'coefficient',
      'density',
      'purity',
      'molarity_value',
      'molarity_unit',
      'target_amount_value',
      'target_amount_unit',
      'location',
      'description',
      'solvent',
      'smiles',
      'molfile',
    ],
    [
      'sample1',
      'reaction1',
      'Ethanol',
      'EXT-001',
      'startingMaterial',
      '1.0',
      '1.0',
      '0.789',
      '99.5',
      '1.0',
      'M',
      '100',
      'mg',
      'Lab A',
      'Starting material for reaction',
      'Water',
      'CCO',
      '',
    ],
    [
      'sample2',
      'reaction1',
      'Product A',
      'EXT-002',
      'product',
      '',
      '1.0',
      '',
      '95',
      '',
      'M',
      '50',
      'mg',
      'Lab A',
      'Main product',
      '',
      'CC(C)O',
      '',
    ],
    [
      'sample3',
      '',
      'Standalone Sample',
      'EXT-003',
      '',
      '',
      '',
      '',
      '',
      '',
      'M',
      '',
      'mg',
      'Lab B',
      'Independent sample without reaction',
      '',
      '',
      '',
    ],
  ]
  const ws_samples = XLSX.utils.aoa_to_sheet(samplesData)
  XLSX.utils.book_append_sheet(wb, ws_samples, 'Samples')

  // Sheet 2: Reactions
  const reactionsData = [
    [
      'identifier',
      'parent',
      'name',
      'description',
      'status',
      'temperature',
      'duration',
      'rxno',
      'solvent',
    ],
    [
      'reaction1',
      '',
      'Esterification',
      'Synthesis of ethyl acetate',
      'Successful',
      '25..50',
      '2h',
      'RXN-001',
      'Ethanol',
    ],
    [
      'reaction2',
      '',
      'Reduction',
      'Hydrogenation reaction',
      'Planned',
      '80',
      '4h',
      'RXN-002',
      'THF',
    ],
  ]
  const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
  XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([wbout], { type: 'application/octet-stream' })
}