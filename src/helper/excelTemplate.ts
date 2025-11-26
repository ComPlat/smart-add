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
      'reactionSchemeType',
      'purity',
      'target_amount_value',
      'target_amount_unit',
      'location',
      'description',
      'smiles',
      'molfile',
    ],
    [
      'sample1',
      'reaction1',
      'Ethanol',
      'EXT-001',
      'startingMaterial',
      '0.995',
      '100',
      'mg',
      'Lab A',
      'Starting material for esterification',
      'CCO',
      '',
    ],
    [
      'sample2',
      'reaction1',
      'Acetic Acid',
      'EXT-002',
      'reactant',
      '0.99',
      '120',
      'mg',
      'Lab A',
      'Reactant for esterification',
      'CC(=O)O',
      '',
    ],
    [
      'sample3',
      'reaction1',
      'Ethyl Acetate',
      'EXT-003',
      'product',
      '0.95',
      '50',
      'mg',
      'Lab A',
      'Main product',
      '',
      '',
    ],
    [
      'sample4',
      '',
      'Complex Structure',
      'EXT-006',
      'none',
      '',
      '',
      'mg',
      'Lab C',
      'Example using MOL file format',
      '',
      '\n  Ketcher 11122513572D 1   1.00000     0.00000     0\n\n 35 35  0  0  0  0  0  0  0  0999 V2000\n    6.3436   -7.5955    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.7260   -6.8116    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    5.9486   -5.8386    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    6.8444   -5.4045    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.3508   -7.5900    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.7514   -5.8379    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    7.9740   -6.8116    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.6545   -6.4186    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.4384   -5.8010    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   12.4114   -6.0236    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   12.8455   -6.9194    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   10.6600   -7.4258    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   12.4121   -7.8264    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   11.4384   -8.0490    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   17.2795   -6.0936    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   18.0634   -5.4760    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   19.0364   -5.6986    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   19.4705   -6.5944    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   17.2850   -7.1008    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   19.0371   -7.5014    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   18.0634   -7.7240    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   13.7436   -5.6455    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   13.1260   -4.8616    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   13.3486   -3.8886    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   14.2444   -3.4545    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   14.7508   -5.6400    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   15.1514   -3.8879    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   15.3740   -4.8616    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   14.8658   -5.7731    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   15.7926   -6.1432    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   16.0864   -7.0971    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   15.5276   -7.9209    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   13.9963   -6.2814    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   14.5254   -7.9991    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n   13.8458   -7.2671    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n  2  1  1  0     0  0\n  1  5  1  0     0  0\n  5  7  1  0     0  0\n  7  6  1  0     0  0\n  6  4  1  0     0  0\n  4  3  1  0     0  0\n  3  2  1  0     0  0\n  9  8  1  0     0  0\n  8 12  1  0     0  0\n 12 14  1  0     0  0\n 14 13  1  0     0  0\n 13 11  1  0     0  0\n 11 10  1  0     0  0\n 10  9  1  0     0  0\n 16 15  1  0     0  0\n 15 19  1  0     0  0\n 19 21  1  0     0  0\n 21 20  1  0     0  0\n 20 18  1  0     0  0\n 18 17  1  0     0  0\n 17 16  1  0     0  0\n 23 22  1  0     0  0\n 22 26  1  0     0  0\n 26 28  1  0     0  0\n 28 27  1  0     0  0\n 27 25  1  0     0  0\n 25 24  1  0     0  0\n 24 23  1  0     0  0\n 30 29  1  0     0  0\n 29 33  1  0     0  0\n 33 35  1  0     0  0\n 35 34  1  0     0  0\n 34 32  1  0     0  0\n 32 31  1  0     0  0\n 31 30  1  0     0  0\nM  END\n\n',
    ],
    [
      'sample5',
      'reaction1',
      'Sulfuric Acid',
      'EXT-004',
      'solvent',
      '0.98',
      '5',
      'ml',
      'Lab A',
      'Catalyst - no structure data needed',
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
      'name',
      'description',
      'status',
      'temperature',
      'duration',
    ],
    [
      'reaction1',
      'Esterification',
      'Synthesis of ethyl acetate',
      'Successful',
      '25',
      '2h',
    ],
  ]
  const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
  XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

  // Generate Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([wbout], { type: 'application/octet-stream' })
}
