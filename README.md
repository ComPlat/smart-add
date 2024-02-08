# SmartAdd

## Wireframe

<https://www.figma.com/file/mpZ5QeOaOpkj3AaPeoKaus/Wireframes?type=design&node-id=109-13398&mode=design&t=2xpSfEaSiHmBlR47-0>

## Mockups

<https://www.figma.com/file/Iczx5uvb1oGyjQ0FQVv3ob/Mockups?type=design&node-id=351-23224&mode=design&t=C9tyBdwB37KDZwh5-0>

## Setup

1. Install asdf
2. `asdf plugin add nodejs`
3. `asdf plugin add pnpm`
4. Install packages with the right version using `asdf install`

### Used dependencies

- Node.js, version 18.17.1 (LTS)
- pnpm, version 8.8.0

## Production

The project is hosted at
<https://vercel.com/cleaner-code/smart-add>

## Development

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Cypress is used for E2E and component tests.

Why Cypress: <https://docs.cypress.io/guides/overview/why-cypress>
Configuration: <https://docs.cypress.io/guides/references/configuration>

To run the testing suite headless in the background, just run

```bash
pnpm e2e:headless
```

for E2E tests or

```bash
pnpm component:headless
```

for component tests.

## Linting

For linting the codebase, ESLint and strict rulesets for Next.js and TypeScript are used for increasing code quality and consistency.

To run the linting, just run

```bash
pnpm lint
```

or

```bash
pnpm lint --fix
```

to automatically fix problems.

## Parsing spreadsheets

Accepted spreadsheet file extensions: <https://docs.sheetjs.com/docs/miscellany/formats>

Elements can be nested, e.g. 2 samples with 3 analyses in 1 reaction. For each element an own sheet should exist.

### Reaction

- r short label
- description
- temperature
- duration

### Sample

- residue_type
- decoupled
- molecular mass (decoupled)
- sum formula (decoupled)
- stereo_abs
- stereo_rel
- cas|image
- sample name
- molecule name
- sample external label
- short label
- description
- real amount
- real unit
- target amount
- target unit
- molarity_value
- density
- molfile
- solvent
- location
- secret
- sample readout
- melting pt
- boiling pt
- created_at
- updated_at
- user_labels
- literatures
- canonical smiles

### Analysis

- sample name
- sample external label
- short label
- name
- description
- uuid
- kind
- status
- content
- dataset name
- instrument
- dataset description
- filename
- checksum

### Error handling

An item will not be displayed or thrown an error message when one of the following conditions will be fulfilled:

- when one header items differs from the default
- when content of a cell is of a different type

## Export.json structure

### Reaction

- Labimotion::ElementKlass
- Labimotion::SegmentKlass
- Labimotion::DatasetKlass
- Collection
- Sample
- CollectionsSample
- Fingerprint
- Molecule
- MoleculeName
- Container
- Labimotion::Dataset
- Attachment
- Reaction
- CollectionsReaction
- ReactionsStartingMaterialSample
- ReactionsReactantSample
- ReactionsProductSample

### Sample

- Collection
- Sample
- CollectionsSample
- Fingerprint
- Molecule
- MoleculeName
- Container
- Attachment

### Analysis

- Dataset
- Attachment

The `container type` of a Container can be one of the following types:

- analysis
- analyses
- dataset

Also, Container has `extended_metadata` where the following information is saved:

- kind
- index
- report
- status
- instrument

If `container_type` is a analysis, it additionally has the following attribute inside of `extended_metadata`:

- content

If `container_type` is null, the object is either a sample or a reaction.
