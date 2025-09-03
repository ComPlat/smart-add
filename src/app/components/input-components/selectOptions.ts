import { SelectOption } from './SelectField'

export const tlcSolventsOptions: SelectOption[] = [
  {
    value: 'cyclohexane/ethyl acetate 20:1',
    label: 'cyclohexane/ethyl acetate 20:1',
  },
  { value: 'CH₂Cl₂/MeOH 20:1', label: 'CH₂Cl₂/MeOH 20:1' },
  {
    value: 'cyclohexane/ethyl acetate 20:1 + 1% NEt₃',
    label: 'cyclohexane/ethyl acetate 20:1 + 1% NEt₃',
  },
]

export const statusOptions: SelectOption[] = [
  { value: 'Planned', label: 'Planned' },
  { value: 'Running', label: 'Running' },
  { value: 'Done', label: 'Done' },
  { value: 'Successful', label: 'Successful' },
  { value: 'Not Successful', label: 'Not Successful' },
  { value: 'Analyses Pending', label: 'Analyses Pending' },
]

export const analysisStatusOptions: SelectOption[] = [
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Unconfirmed', label: 'Unconfirmed' },
]

export const roleOptions: SelectOption[] = [
  {
    label: 'General Procedure',
    value: 'gp',
  },
  {
    label: 'Parts of GP',
    value: 'parts',
  },
  {
    label: 'Single',
    value: 'single',
  }
]