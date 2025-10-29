import { retrieveTree } from '@/helper/retrieveTree'
import { ExtendedFile, ExtendedFolder } from '@/database/db'

describe('retrieveTree - Reaction Children Sorting', () => {
  const createMockFile = (
    name: string,
    fullPath: string,
    parentUid: string,
    treeId: string,
  ): ExtendedFile => ({
    extension: 'txt',
    file: new Blob(['test']),
    fullPath,
    isFolder: false,
    name,
    parentUid,
    path: fullPath.split('/'),
    treeId,
    uid: `file-${name}`,
  })

  const createMockFolder = (
    name: string,
    fullPath: string,
    parentUid: string,
    treeId: string,
    dtype: ExtendedFolder['dtype'],
    reactionSchemeType: ExtendedFolder['reactionSchemeType'],
  ): ExtendedFolder => ({
    dtype,
    fullPath,
    isFolder: true,
    name,
    parentUid,
    reactionSchemeType,
    treeId,
    uid: `folder-${name}`,
  })

  it('should sort reaction children by reactionSchemeType', () => {
    const treeId = 'test-tree'
    const reactionUid = 'folder-Reaction'

    const folders: ExtendedFolder[] = [
      createMockFolder('Reaction', 'Reaction', 'root', treeId, 'reaction', 'none'),
      createMockFolder('Sample', 'Reaction/Sample', reactionUid, treeId, 'sample', 'product'),
      createMockFolder('Sample_1', 'Reaction/Sample_1', reactionUid, treeId, 'sample', 'reactant'),
      createMockFolder('Sample_2', 'Reaction/Sample_2', reactionUid, treeId, 'sample', 'startingMaterial'),
      createMockFolder('Sample_3', 'Reaction/Sample_3', reactionUid, treeId, 'sample', 'solvent'),
      createMockFolder('analyses', 'Reaction/analyses', reactionUid, treeId, 'analyses', 'none'),
    ]

    const files: ExtendedFile[] = []

    const tree = retrieveTree(files, folders, treeId)

    // Get the Reaction folder node
    const reactionNode = tree['Reaction']
    expect(reactionNode).to.exist

    // Check that children are sorted in the correct order
    const expectedOrder = [
      'Reaction/Sample_2',   // startingMaterial (1)
      'Reaction/Sample_1',   // reactant (2)
      'Reaction/Sample_3',   // solvent (3)
      'Reaction/Sample',     // product (4)
      'Reaction/analyses',   // none (5)
    ]

    expect(reactionNode.children).to.deep.equal(expectedOrder)
  })

  it('should not sort children of non-reaction folders', () => {
    const treeId = 'test-tree'
    const sampleUid = 'folder-Sample'

    const folders: ExtendedFolder[] = [
      createMockFolder('Sample', 'Sample', 'root', treeId, 'sample', 'product'),
      createMockFolder('analyses', 'Sample/analyses', sampleUid, treeId, 'analyses', 'none'),
      createMockFolder('molecule', 'Sample/molecule', sampleUid, treeId, 'molecule', 'none'),
    ]

    const files: ExtendedFile[] = []

    const tree = retrieveTree(files, folders, treeId)

    const sampleNode = tree['Sample']
    expect(sampleNode).to.exist

    // Children should maintain original order (not sorted)
    // The order depends on how Object.keys processes the children
    expect(sampleNode.children).to.have.lengthOf(2)
    expect(sampleNode.children).to.include('Sample/analyses')
    expect(sampleNode.children).to.include('Sample/molecule')
  })

  it('should handle reaction with mixed files and folders', () => {
    const treeId = 'test-tree'
    const reactionUid = 'folder-Reaction'

    const folders: ExtendedFolder[] = [
      createMockFolder('Reaction', 'Reaction', 'root', treeId, 'reaction', 'none'),
      createMockFolder('Sample_1', 'Reaction/Sample_1', reactionUid, treeId, 'sample', 'reactant'),
      createMockFolder('Sample_2', 'Reaction/Sample_2', reactionUid, treeId, 'sample', 'product'),
    ]

    const files: ExtendedFile[] = [
      createMockFile('notes.txt', 'Reaction/notes.txt', reactionUid, treeId),
      createMockFile('data.csv', 'Reaction/data.csv', reactionUid, treeId),
    ]

    const tree = retrieveTree(files, folders, treeId)

    const reactionNode = tree['Reaction']
    expect(reactionNode).to.exist

    // Folders should be sorted, then files should appear
    // Files are treated as 'none' (sort order 5)
    const childrenPaths = reactionNode.children

    // Find indices
    const sample1Index = childrenPaths.indexOf('Reaction/Sample_1')
    const sample2Index = childrenPaths.indexOf('Reaction/Sample_2')

    // Sample_1 (reactant=2) should come before Sample_2 (product=4)
    expect(sample1Index).to.be.lessThan(sample2Index)
  })

  it('should handle empty reaction folder', () => {
    const treeId = 'test-tree'

    const folders: ExtendedFolder[] = [
      createMockFolder('Reaction', 'Reaction', 'root', treeId, 'reaction', 'none'),
    ]

    const files: ExtendedFile[] = []

    const tree = retrieveTree(files, folders, treeId)

    const reactionNode = tree['Reaction']
    expect(reactionNode).to.exist
    expect(reactionNode.children).to.be.an('array')
  })

  it('should sort multiple samples with same reactionSchemeType consistently', () => {
    const treeId = 'test-tree'
    const reactionUid = 'folder-Reaction'

    const folders: ExtendedFolder[] = [
      createMockFolder('Reaction', 'Reaction', 'root', treeId, 'reaction', 'none'),
      createMockFolder('Sample_A', 'Reaction/Sample_A', reactionUid, treeId, 'sample', 'reactant'),
      createMockFolder('Sample_B', 'Reaction/Sample_B', reactionUid, treeId, 'sample', 'reactant'),
      createMockFolder('Sample_C', 'Reaction/Sample_C', reactionUid, treeId, 'sample', 'product'),
    ]

    const files: ExtendedFile[] = []

    const tree = retrieveTree(files, folders, treeId)

    const reactionNode = tree['Reaction']
    expect(reactionNode).to.exist

    const childrenPaths = reactionNode.children

    // All reactants should come before products
    const sampleAIndex = childrenPaths.indexOf('Reaction/Sample_A')
    const sampleBIndex = childrenPaths.indexOf('Reaction/Sample_B')
    const sampleCIndex = childrenPaths.indexOf('Reaction/Sample_C')

    expect(sampleAIndex).to.be.lessThan(sampleCIndex)
    expect(sampleBIndex).to.be.lessThan(sampleCIndex)
  })

  it('should maintain sort order: startingMaterial → reactant → solvent → product → none', () => {
    const treeId = 'test-tree'
    const reactionUid = 'folder-Reaction'

    const folders: ExtendedFolder[] = [
      createMockFolder('Reaction', 'Reaction', 'root', treeId, 'reaction', 'none'),
      createMockFolder('Z_Product', 'Reaction/Z_Product', reactionUid, treeId, 'sample', 'product'),
      createMockFolder('A_StartMat', 'Reaction/A_StartMat', reactionUid, treeId, 'sample', 'startingMaterial'),
      createMockFolder('M_Solvent', 'Reaction/M_Solvent', reactionUid, treeId, 'sample', 'solvent'),
      createMockFolder('B_Reactant', 'Reaction/B_Reactant', reactionUid, treeId, 'sample', 'reactant'),
      createMockFolder('Z_Other', 'Reaction/Z_Other', reactionUid, treeId, 'folder', 'none'),
    ]

    const files: ExtendedFile[] = []

    const tree = retrieveTree(files, folders, treeId)

    const reactionNode = tree['Reaction']
    const childrenPaths = reactionNode.children

    // Verify order regardless of alphabetical names
    const startMatIndex = childrenPaths.indexOf('Reaction/A_StartMat')
    const reactantIndex = childrenPaths.indexOf('Reaction/B_Reactant')
    const solventIndex = childrenPaths.indexOf('Reaction/M_Solvent')
    const productIndex = childrenPaths.indexOf('Reaction/Z_Product')
    const otherIndex = childrenPaths.indexOf('Reaction/Z_Other')

    expect(startMatIndex).to.be.lessThan(reactantIndex, 'startingMaterial before reactant')
    expect(reactantIndex).to.be.lessThan(solventIndex, 'reactant before solvent')
    expect(solventIndex).to.be.lessThan(productIndex, 'solvent before product')
    expect(productIndex).to.be.lessThan(otherIndex, 'product before none')
  })
})
