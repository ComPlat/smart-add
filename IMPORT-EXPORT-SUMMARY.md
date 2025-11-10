# Import/Export Implementation Summary

## What Was Accomplished

### 1. **Import from Chemotion ELN Export (JSON/ZIP)**
- ✅ Import JSON or ZIP files from Chemotion ELN
- ✅ Support for 17 samples, 4 reactions with full hierarchy
- ✅ Proper nesting: Reactions → Samples → Molecules → Analyses

### 2. **Complete Data Structure**
```
Collection/
├── Sample-1/
│   ├── molecule/           (molfile, cano_smiles, etc.)
│   └── analyses/
│       ├── 1H NMR/
│       ├── 13C NMR/
│       └── Mass Spec/
├── Reaction-1/
│   ├── Sample-2/          (startingMaterial)
│   │   ├── molecule/
│   │   └── analyses/
│   ├── Sample-3/          (product)
│   │   ├── molecule/
│   │   └── analyses/
│   └── analyses/          (reaction's own analyses)
└── ...
```

## Key Fixes Implemented

### Fix #1: Unique Sample/Reaction Names
**Problem:** All samples named "Sample" → overwrote each other
**Solution:** Append UID suffix → `Sample-59594a5c`, `Sample-21c73936`

```typescript
const baseName = sample.name || sample.short_label || sample.external_label || 'Sample'
folderName = baseName === 'Sample' ? `${baseName}-${containableId.slice(0, 8)}` : baseName
```

### Fix #2: Complete Sample Metadata
**Problem:** Imported samples only had 8 fields, missing 35+ required fields
**Solution:** Merge with sampleTemplate

```typescript
metadata = {
  ...sampleTemplate,  // All 40+ fields with defaults
  ...sample,          // Imported data overrides
  created_at: sample.created_at || new Date().toISOString(),
  updated_at: sample.updated_at || new Date().toISOString(),
}
```

### Fix #3: Complete Molecule Metadata
**Problem:** Molecule folders only had 3 fields (molfile, molecule_id, sample_svg_file)
**Solution:** Merge with moleculeTemplate

```typescript
metadata = {
  ...moleculeTemplate,  // All molecule fields (cano_smiles, inchikey, etc.)
  molfile: sample.molfile,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
```

### Fix #4: Export Container Type
**Problem:** Export created containers with `container_type: null`
**Solution:** Set `container_type: 'root'` for sample/reaction/molecule containers

```typescript
const dtypeMapping = {
  sample: {
    containable_id: sampleReactionUidMap[folder.uid],
    containable_type: 'Sample',
    container_type: 'root',  // ← Added
  },
  // ... same for reaction and molecule
}
```

### Fix #5: Reaction-Sample Nesting
**Problem:** Samples created before parent reactions → placed at collection root
**Solution:** Sort reactions before samples

```typescript
const sortedContainers = Object.entries(exportData.Container).sort(([, a], [, b]) => {
  // Prioritize reactions over samples
  const isReactionA = a.container_type === 'root' && a.containable_type === 'Reaction'
  const isReactionB = b.container_type === 'root' && b.containable_type === 'Reaction'

  if (isReactionA && !isReactionB) return -1
  if (!isReactionA && isReactionB) return 1

  // Then sort by depth
  return depthA - depthB
})
```

## Files Modified

### Core Import Logic
- **`src/helper/importFromZip.ts`** (450 lines)
  - Handles JSON/ZIP parsing
  - Creates folder hierarchy
  - Merges with templates
  - Sorts containers properly
  - Creates molecule folders with full metadata

### Export Improvements
- **`src/app/components/zip-download/container.ts`**
  - Added `container_type: 'root'` for sample/reaction/molecule exports
  - Ensures export format matches Chemotion ELN standard

### Templates
- **`src/app/components/zip-download/templates.ts`** (unchanged, already correct)
  - `sampleTemplate` - 40+ fields
  - `reactionTemplate` - 20+ fields
  - `moleculeTemplate` - 20+ fields

## How Import Works

### 1. File Processing
```typescript
importFromJsonOrZip(file: File)
  ↓
getExportData(file)  // Extracts JSON from .json or .zip
  ↓
Validate: Collection & Container sections exist
```

### 2. Container Processing
```typescript
Sort Containers:
  1. Reactions first
  2. Samples (standalone)
  3. Samples (in reactions)
  4. Molecules
  5. Analyses
  6. Individual analysis types
  7. Datasets

For Each Container:
  ↓
Determine parent UID (collection or reaction)
  ↓
Determine dtype (sample/reaction/molecule/analysis/etc.)
  ↓
Merge with template (sampleTemplate/reactionTemplate/moleculeTemplate)
  ↓
Create folder in IndexedDB
```

### 3. Special Handling
- **Samples:** Check ReactionsXxxSample tables to link to reactions
- **Molecules:** Create subfolder if sample has molfile
- **Analyses:** Create based on container_type

## Data Flow: Create → Export → Import

### Create Sample (UI)
```typescript
createSample("Sample-1", tree)
  ↓
metadata: { ...sampleTemplate, name: "Sample-1", created_at: now }
  ↓
IndexedDB: folders table
```

### Export Sample
```typescript
uidToSample = {
  "uuid": {
    ...sampleTemplate,
    ...folder.metadata,
    molfile: moleculeFolder?.metadata?.molfile,  // Copy from molecule
  }
}

Container = {
  "uuid": {
    container_type: 'root',
    containable_type: 'Sample',
    containable_id: sampleId,
  }
}
```

### Import Sample
```typescript
metadata = {
  ...sampleTemplate,    // Defaults
  ...sample,            // Imported data
  created_at: sample.created_at || now
}

moleculeMetadata = {
  ...moleculeTemplate,  // Defaults
  molfile: sample.molfile,
  created_at: now
}
```

## Testing Checklist

- [x] Import JSON file with 17 samples
- [x] Import JSON file with 4 reactions
- [x] Samples have unique names
- [x] Samples nested under reactions
- [x] Molecule folders created with full metadata
- [x] Analyses folders created with proper types
- [x] Inspector shows all sample fields
- [x] Inspector shows all molecule fields
- [x] Reaction scheme types displayed correctly
- [x] Export → Import roundtrip works

## Known Limitations

1. **Attachments not imported** (marked as TODO)
2. **Molecule data minimal** - Only molfile imported, other fields (SMILES, InChI, etc.) are null/empty (user can fill in inspector)
3. **Chemotion exports may not have Molecule section** - we handle this gracefully

## Next Steps (If Needed)

1. Add attachment import support
2. Calculate molecular properties from molfile (SMILES, InChI, molecular weight)
3. Add progress indicator for large imports
4. Add validation/error reporting UI
5. Support incremental imports (don't duplicate existing data)

## Quick Reference

### Import Entry Point
```typescript
// src/app/components/structure-btns/ImportStructureButton.tsx
import { importFromJsonOrZip } from '@/helper/importFromZip'

const handleImport = async (file: File) => {
  const result = await importFromJsonOrZip(file)
  console.log(result.message) // "Successfully imported ChemScanner Export"
}
```

### Key Constants
- `TARGET_TREE_ROOT = 'assignmentTreeRoot'` - All imports go to assignment tree
- Sort priority: Reactions > Samples > Others
- Unique name suffix: First 8 chars of UUID

### Templates Used
- `sampleTemplate` - Sample defaults (decoupled: true, stereo: {abs: 'any', rel: 'any'}, etc.)
- `reactionTemplate` - Reaction defaults
- `moleculeTemplate` - Molecule defaults (all fields null except timestamps)

## Debugging Tips

If import issues occur:
1. Check browser console for errors
2. Verify export has `Collection` and `Container` sections
3. Check IndexedDB in DevTools → Application → IndexedDB → filesDatabase → folders
4. Verify folder hierarchy: parentUid chain should be valid
5. Check treeId = 'assignmentTreeRoot' for all imported items
