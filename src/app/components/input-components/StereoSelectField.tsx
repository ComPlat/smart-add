import SelectField, { SelectOption } from './SelectField'

export interface StereoSelectFieldProps {
  className?: string
  id?: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  readonly?: boolean
  value?: string
  type: 'abs' | 'rel'
}

const StereoSelectField: React.FC<StereoSelectFieldProps> = ({
  className = '',
  id,
  onChange,
  readonly = false,
  value = '',
  type,
}) => {
  const stereoOptions: Record<'abs' | 'rel', SelectOption[]> = {
    abs: [
      { value: 'any', label: 'any' },
      { value: 'rac', label: 'rac' },
      { value: 'meso', label: 'meso' },
      { value: 'delta', label: 'delta' },
      { value: 'lambda', label: 'lambda' },
      { value: '(S)', label: '(S)' },
      { value: '(R)', label: '(R)' },
      { value: '(Sp)', label: '(Sp)' },
      { value: '(Rp)', label: '(Rp)' },
      { value: '(Sa)', label: '(Sa)' },
      { value: '(Ra)', label: '(Ra)' },
    ],
    rel: [
      { value: 'any', label: 'any' },
      { value: 'syn', label: 'syn' },
      { value: 'anti', label: 'anti' },
      { value: 'p-geminal', label: 'p-geminal' },
      { value: 'p-ortho', label: 'p-ortho' },
      { value: 'p-meta', label: 'p-meta' },
      { value: 'p-para', label: 'p-para' },
      { value: 'cis', label: 'cis' },
      { value: 'trans', label: 'trans' },
      { value: 'fac', label: 'fac' },
      { value: 'mer', label: 'mer' },
    ],
  }

  const options = stereoOptions[type]
  const placeholder =
    type === 'abs'
      ? 'Select absolute stereochemistry'
      : 'Select relative stereochemistry'

  return (
    <SelectField
      className={className}
      id={id}
      name={`stereo_${type}`}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      readonly={readonly}
      value={value}
    />
  )
}

export default StereoSelectField
