import {
  formatProfileAddress,
  formatProfileBank,
  formatProfileContact,
  formatProfileSignatory,
  gstProfileService,
  orNotAvailable,
  type GstBusinessProfile,
} from '@modules/gst/services/gstProfileService'

export interface AmendmentConfig {
  title: string
  currentValue: string
  currentLabel?: string
  inputLabel: string
  placeholder: string
  proofs: string[]
}

type AmendmentConfigTemplate = Omit<AmendmentConfig, 'currentValue'> & {
  currentValue: (profile: GstBusinessProfile) => string
}

const AMENDMENT_CONFIG_TEMPLATES: Record<string, AmendmentConfigTemplate> = {
  legal_name: {
    title: 'Legal Business Name',
    currentValue: (p) => orNotAvailable(p.legalName),
    currentLabel: 'Legal Name',
    inputLabel: 'New Legal Business Name',
    placeholder: 'Enter legal business name',
    proofs: [
      'Certificate of Incorporation / Name Change Certificate',
      'Revised Certificate of Incorporation',
      'Government-issued business registration certificate showing the new legal name',
      'Revised LLP / Partnership Registration Document',
      'Government-issued order/document reflecting the changed legal name',
      'Other official name-change supporting document',
    ],
  },
  principal_place: {
    title: 'Principal Place of Business',
    currentValue: formatProfileAddress,
    currentLabel: 'Principal Address',
    inputLabel: 'New Principal Address',
    placeholder: 'Enter business address',
    proofs: [
      'Property Tax Receipt',
      'Municipal Khata Certificate / Khata Copy',
      'Electricity Bill',
      'Rent / Lease Agreement',
      'Consent Letter',
      'Government-issued document/certificate showing the premises',
      'Legal ownership document',
    ],
  },
  additional_place: {
    title: 'Additional Place of Business',
    currentValue: () => 'None on record',
    currentLabel: 'Additional Place Address',
    inputLabel: 'New Additional Place Address',
    placeholder: 'Enter business address',
    proofs: [
      'Property Tax Receipt',
      'Municipal Khata Certificate / Khata Copy',
      'Electricity Bill',
      'Rent / Lease Agreement',
      'Consent Letter',
      'Government-issued document/certificate showing the premises',
      'Legal ownership document',
    ],
  },
  bank_accounts: {
    title: 'Bank Accounts',
    currentValue: formatProfileBank,
    currentLabel: 'Bank Account Details',
    inputLabel: 'New Bank Account Details',
    placeholder: 'Enter Account Number & IFSC Code',
    proofs: [
      'Cancelled Cheque with printed business name',
      'Bank Statement first page (showing name, A/C no & IFSC)',
      'Bank Passbook first page with branch stamp',
    ],
  },
  authorised_signatories: {
    title: 'Authorised Signatories',
    currentValue: formatProfileSignatory,
    currentLabel: 'Authorised Signatory Name',
    inputLabel: 'New Authorised Signatory Name',
    placeholder: 'Enter full name as per Aadhaar/PAN',
    proofs: [
      'Letter of Authorisation',
      'Board Resolution',
      'Managing Committee Resolution',
      'Acceptance Letter accompanying the Resolution',
      'Applicable official appointment / authorisation document',
      'Other official authorisation document applicable to the entity',
    ],
  },
  contact_details: {
    title: 'Contact Details',
    currentValue: formatProfileContact,
    currentLabel: 'Contact Details',
    inputLabel: 'New Primary Contact Mobile & Email',
    placeholder: 'Enter new mobile number & official email',
    proofs: [
      'Official government/business registration document showing the updated contact details',
      'Official government correspondence showing the updated contact details',
      'Other supporting document showing the updated contact details',
      'Board Resolution / Authorization for contact update',
      'Utility Bill in the name of the entity / authorized person',
      'Other official document evidencing the contact detail change',
    ],
  },
}

/** Amendment form config with the "current value" taken from the user's GST profile */
export const getAmendmentConfig = (id: string, fallbackTitle: string): AmendmentConfig => {
  const template = AMENDMENT_CONFIG_TEMPLATES[id]
  if (!template) {
    return { title: fallbackTitle, currentValue: 'Current details', currentLabel: 'Current details', inputLabel: 'New Value', placeholder: 'Enter new value', proofs: [] }
  }
  return { ...template, currentValue: template.currentValue(gstProfileService.get()) }
}
