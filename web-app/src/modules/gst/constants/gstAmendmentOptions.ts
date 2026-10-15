/** Amendment cards shown on the GST amendment selection screen */

export interface AmendmentCardItem {
  id: string
  title: string
  subtitle: string
  type: 'core' | 'non_core'
  iconType: 'tag' | 'building' | 'store' | 'wallet' | 'pen' | 'phone'
  bgColor: string
  iconColor: string
}

export const CORE_AMENDMENTS: AmendmentCardItem[] = [
  { id: 'legal_name', title: 'Legal Business Name', subtitle: 'Core amendment - officer approval required', type: 'core', iconType: 'tag', bgColor: '#fff7ed', iconColor: '#ea580c' },
  { id: 'principal_place', title: 'Principal Place of Business', subtitle: 'Core amendment - officer approval required', type: 'core', iconType: 'building', bgColor: '#eff6ff', iconColor: '#2563eb' },
  { id: 'additional_place', title: 'Additional Place of Business', subtitle: 'Core amendment - officer approval required', type: 'core', iconType: 'store', bgColor: '#eff6ff', iconColor: '#2563eb' },
]

export const NON_CORE_AMENDMENTS: AmendmentCardItem[] = [
  { id: 'bank_accounts', title: 'Bank Accounts', subtitle: 'Non-core - auto-approved', type: 'non_core', iconType: 'wallet', bgColor: '#f3e8ff', iconColor: '#9333ea' },
  { id: 'authorised_signatories', title: 'Authorised Signatories', subtitle: 'Non-core - auto-approved', type: 'non_core', iconType: 'pen', bgColor: '#fff7ed', iconColor: '#ea580c' },
  { id: 'contact_details', title: 'Contact Details', subtitle: 'Non-core - auto-approved', type: 'non_core', iconType: 'phone', bgColor: '#fce7f3', iconColor: '#db2777' },
]

/** Every amendment card, used to restore the one picked in a saved draft */
export const AMENDMENT_OPTIONS: readonly AmendmentCardItem[] = [...CORE_AMENDMENTS, ...NON_CORE_AMENDMENTS]
