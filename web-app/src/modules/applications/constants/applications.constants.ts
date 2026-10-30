import type { ApplicationCategory } from '../types/applications.types'

export const APPLICATION_CATEGORIES: { id: ApplicationCategory; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'GST', label: 'GST' },
  { id: 'ITR', label: 'ITR' },
  { id: 'Loans', label: 'Loans' },
  { id: 'Company Registration', label: 'Company Registration' },
  { id: 'Business', label: 'Business' },
  { id: 'Insurance', label: 'Insurance' },
]
