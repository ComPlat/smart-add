import { parseExcelToExportJson } from '@/helper/excelParser'
import * as XLSX from 'xlsx'

describe('excelParser', () => {
  describe('parseExcelToExportJson', () => {
    it('should parse Excel with samples and reactions', async () => {
      // Create a simple test Excel file
      const wb = XLSX.utils.book_new()

      const samplesData = [
        ['identifier', 'parent', 'name', 'smiles'],
        ['sample1', 'reaction1', 'Ethanol', 'CCO'],
      ]
      const ws_samples = XLSX.utils.aoa_to_sheet(samplesData)
      XLSX.utils.book_append_sheet(wb, ws_samples, 'Samples')

      const reactionsData = [
        ['identifier', 'name', 'description'],
        ['reaction1', 'Test Reaction', 'A test'],
      ]
      const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
      XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

      // Convert to File
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const file = new File([blob], 'test.xlsx')

      // Parse the file
      const result = await parseExcelToExportJson(file)

      // Verify structure
      expect(result).to.have.property('Collection')
      expect(result).to.have.property('Reaction')
      expect(result).to.have.property('Sample')
      expect(result).to.have.property('CollectionsReaction')
      expect(result).to.have.property('CollectionsSample')

      // Verify we have one collection
      const collections = Object.values(result.Collection as object)
      expect(collections).to.have.length(1)
      expect(collections[0]).to.have.property('label')
      expect(collections[0].label).to.include('Excel Import')

      // Verify we have one reaction
      const reactions = Object.values(result.Reaction as object)
      expect(reactions).to.have.length(1)
      expect(reactions[0]).to.have.property('name', 'Test Reaction')

      // Verify we have one sample
      const samples = Object.values(result.Sample as object)
      expect(samples).to.have.length(1)
      expect(samples[0]).to.have.property('name', 'Ethanol')
    })

    it('should parse Excel with only samples', async () => {
      const wb = XLSX.utils.book_new()

      const samplesData = [
        ['identifier', 'name', 'smiles'],
        ['sample1', 'Water', 'O'],
      ]
      const ws_samples = XLSX.utils.aoa_to_sheet(samplesData)
      XLSX.utils.book_append_sheet(wb, ws_samples, 'Samples')

      const reactionsData = [['identifier', 'name']]
      const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
      XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout])
      const file = new File([blob], 'test.xlsx')

      const result = await parseExcelToExportJson(file)

      // Should have collection and sample
      expect(result).to.have.property('Collection')
      expect(result).to.have.property('Sample')

      const samples = Object.values(result.Sample as object)
      expect(samples).to.have.length(1)
      expect(samples[0]).to.have.property('name', 'Water')
    })

    it('should handle samples with parent relationships', async () => {
      const wb = XLSX.utils.book_new()

      const samplesData = [
        ['identifier', 'parent', 'name'],
        ['sample1', 'reaction1', 'Parent Sample'],
        ['sample2', 'sample1', 'Child Sample'],
      ]
      const ws_samples = XLSX.utils.aoa_to_sheet(samplesData)
      XLSX.utils.book_append_sheet(wb, ws_samples, 'Samples')

      const reactionsData = [
        ['identifier', 'name'],
        ['reaction1', 'Parent Reaction'],
      ]
      const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
      XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout])
      const file = new File([blob], 'test.xlsx')

      const result = await parseExcelToExportJson(file)

      // Both samples should be created
      const samples = Object.values(result.Sample as object)
      expect(samples).to.have.length(2)
    })

    it('should handle SMILES in samples', async () => {
      const wb = XLSX.utils.book_new()

      const samplesData = [
        ['identifier', 'name', 'smiles'],
        ['sample1', 'Ethanol', 'CCO'],
        ['sample2', 'Methanol', 'CO'],
      ]
      const ws_samples = XLSX.utils.aoa_to_sheet(samplesData)
      XLSX.utils.book_append_sheet(wb, ws_samples, 'Samples')

      const reactionsData = [['identifier', 'name']]
      const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
      XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout])
      const file = new File([blob], 'test.xlsx')

      const result = await parseExcelToExportJson(file)

      // Should create molecules for samples with SMILES
      expect(result).to.have.property('Molecule')
      const molecules = Object.values(result.Molecule as object)
      expect(molecules).to.have.length(2)
    })

    it('should create molecules for all samples (even without SMILES)', async () => {
      const wb = XLSX.utils.book_new()

      const samplesData = [
        ['identifier', 'name', 'smiles'],
        ['sample1', 'Ethanol', 'CCO'],
        ['sample2', 'No Structure', ''],
      ]
      const ws_samples = XLSX.utils.aoa_to_sheet(samplesData)
      XLSX.utils.book_append_sheet(wb, ws_samples, 'Samples')

      const reactionsData = [['identifier', 'name']]
      const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
      XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout])
      const file = new File([blob], 'test.xlsx')

      const result = await parseExcelToExportJson(file)

      // Should create molecules for ALL samples
      expect(result).to.have.property('Molecule')
      const molecules = Object.values(result.Molecule as object)
      expect(molecules).to.have.length(2)

      // Second sample should have molecule with null SMILES
      const samples = Object.values(result.Sample as object) as any[]
      expect(samples).to.have.length(2)
      samples.forEach((sample) => {
        expect(sample.molecule_id).to.not.be.null
        expect(sample.decoupled).to.equal(false)
      })
    })

    it('should create reaction-sample links with reactionSchemeType', async () => {
      const wb = XLSX.utils.book_new()

      const samplesData = [
        [
          'identifier',
          'parent',
          'name',
          'reactionSchemeType',
          'smiles',
        ],
        ['sample1', 'reaction1', 'Ethanol', 'startingMaterial', 'CCO'],
        ['sample2', 'reaction1', 'Acetic Acid', 'reactant', 'CC(=O)O'],
        ['sample3', 'reaction1', 'Ethyl Acetate', 'product', 'CCOC(C)=O'],
        ['sample4', 'reaction1', 'Water', 'solvent', 'O'],
      ]
      const ws_samples = XLSX.utils.aoa_to_sheet(samplesData)
      XLSX.utils.book_append_sheet(wb, ws_samples, 'Samples')

      const reactionsData = [
        ['identifier', 'name', 'description'],
        ['reaction1', 'Esterification', 'Test reaction'],
      ]
      const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
      XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout])
      const file = new File([blob], 'test.xlsx')

      const result = await parseExcelToExportJson(file)

      // Verify reaction-sample links were created
      expect(result).to.have.property('ReactionsStartingMaterialSample')
      expect(result).to.have.property('ReactionsReactantSample')
      expect(result).to.have.property('ReactionsProductSample')
      expect(result).to.have.property('ReactionsSolventSample')

      const startingMaterials = Object.values(
        result.ReactionsStartingMaterialSample as object,
      )
      const reactants = Object.values(result.ReactionsReactantSample as object)
      const products = Object.values(result.ReactionsProductSample as object)
      const solvents = Object.values(result.ReactionsSolventSample as object)

      expect(startingMaterials).to.have.length(1)
      expect(reactants).to.have.length(1)
      expect(products).to.have.length(1)
      expect(solvents).to.have.length(1)
    })

    it('should not create reaction-sample links for samples without reactionSchemeType', async () => {
      const wb = XLSX.utils.book_new()

      const samplesData = [
        ['identifier', 'parent', 'name', 'reactionSchemeType', 'smiles'],
        ['sample1', 'reaction1', 'Ethanol', '', 'CCO'],
        ['sample2', '', 'Standalone', 'none', 'CO'],
      ]
      const ws_samples = XLSX.utils.aoa_to_sheet(samplesData)
      XLSX.utils.book_append_sheet(wb, ws_samples, 'Samples')

      const reactionsData = [
        ['identifier', 'name'],
        ['reaction1', 'Test Reaction'],
      ]
      const ws_reactions = XLSX.utils.aoa_to_sheet(reactionsData)
      XLSX.utils.book_append_sheet(wb, ws_reactions, 'Reactions')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout])
      const file = new File([blob], 'test.xlsx')

      const result = await parseExcelToExportJson(file)

      // Should not create any reaction-sample links
      const startingMaterials = Object.values(
        result.ReactionsStartingMaterialSample as object,
      )
      const reactants = Object.values(result.ReactionsReactantSample as object)
      const products = Object.values(result.ReactionsProductSample as object)
      const solvents = Object.values(result.ReactionsSolventSample as object)

      expect(startingMaterials).to.have.length(0)
      expect(reactants).to.have.length(0)
      expect(products).to.have.length(0)
      expect(solvents).to.have.length(0)
    })
  })
})
