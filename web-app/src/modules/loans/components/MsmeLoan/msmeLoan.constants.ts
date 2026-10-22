import { routePaths } from '@core/config'
import { INDIAN_STATE_DROPDOWN_OPTIONS } from '@shared/services/indianStates'
import type { FlowStepItem } from '@shared/components'
import type { MsmeLoanData } from '@modules/loans/types/msmeLoan.types'
import type { LoanAddress, LoanAddressField } from '@modules/loans/types'

export const MSME_LOAN_TITLE = 'MSME Loan'
export const MSME_LOAN_TYPE = 'msme_loan'
export const MSME_LOAN_RESUME_ROUTE = routePaths.loansMsmeLoan

export const MSME_LOAN_STEPS: FlowStepItem[] = [
  { stepNumber: 1, title: 'KYC Verification', shortLabel: 'KYC' },
  { stepNumber: 2, title: 'MSME & Business Details', shortLabel: 'Business' },
  { stepNumber: 3, title: 'Documents', shortLabel: 'Documents' },
  { stepNumber: 4, title: 'Review', shortLabel: 'Review' },
  { stepNumber: 5, title: 'Submit', shortLabel: 'Submit' },
]

export const MSME_LOAN_FORM_STEP_COUNT = 4

export const EMPTY_ADDRESS: LoanAddress = {
  houseBuilding: '',
  streetLocality: '',
  city: '',
  pincode: '',
  state: '',
}

export const INITIAL_MSME_LOAN_DATA: MsmeLoanData = {
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: 'yes',
  permanentAddress: EMPTY_ADDRESS,
  kycConsent: false,
  businessName: '',
  businessConstitution: '',
  businessActivity: '',
  establishmentDate: '',
  operatingAddress: EMPTY_ADDRESS,
  udyamStatus: '',
  udyamNumber: '',
  gstStatus: '',
  gstin: '',
  annualTurnover: '',
  avgMonthlySales: '',
  requestedLoanAmount: '',
  loanAmount: '',
  loanPurpose: '',
  msmeCategory: '',
  enterpriseType: '',
  businessVintage: '',
  uploadedDocs: {},
  termsAccepted: false,
}

export const BUSINESS_CONSTITUTION_OPTIONS = [
  { value: 'Proprietorship', label: 'Proprietorship' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'LLP', label: 'LLP' },
  { value: 'Private Limited Company', label: 'Private Limited Company' },
  { value: 'Public Limited Company', label: 'Public Limited Company' },
  { value: 'Other', label: 'Other' },
] as const

export const PRIMARY_BUSINESS_ACTIVITY_OPTIONS = [
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Service Provider', label: 'Service Provider' },
  { value: 'Wholesale Trading', label: 'Wholesale Trading' },
  { value: 'Retail Trading', label: 'Retail Trading' },
  { value: 'IT / Software Services', label: 'IT / Software Services' },
  { value: 'Food & Agro Processing', label: 'Food & Agro Processing' },
  { value: 'Textiles & Apparel', label: 'Textiles & Apparel' },
  { value: 'Automotive & Engineering', label: 'Automotive & Engineering' },
  { value: 'Other', label: 'Other' },
] as const

export const UDYAM_REGISTRATION_STATUS_OPTIONS = [
  { value: 'Registered', label: 'Registered' },
  { value: 'Not Registered', label: 'Not Registered' },
  { value: 'Applied / Pending', label: 'Applied / Pending' },
] as const

export const GST_REGISTRATION_STATUS_OPTIONS = [
  { value: 'Registered', label: 'Registered' },
  { value: 'Not Registered', label: 'Not Registered' },
  { value: 'Exempt', label: 'Exempt' },
] as const

export const LOAN_PURPOSE_OPTIONS = [
  { value: 'Working Capital', label: 'Working Capital' },
  { value: 'Business Expansion', label: 'Business Expansion' },
  { value: 'Machinery / Equipment Purchase', label: 'Machinery / Equipment Purchase' },
  { value: 'Inventory / Raw Material', label: 'Inventory / Raw Material' },
  { value: 'Technology / Infrastructure Upgrade', label: 'Technology / Infrastructure Upgrade' },
  { value: 'Debt Consolidation', label: 'Debt Consolidation' },
  { value: 'Other', label: 'Other' },
] as const

export const STATE_OPTIONS = INDIAN_STATE_DROPDOWN_OPTIONS

export const ADDRESS_LIMITS = {
  houseBuilding: 120,
  streetLocality: 150,
  city: 60,
  pincode: 6,
} as const

/** Typing filters: pure functional transforms that sanitize address inputs */
export const ADDRESS_INPUT_FILTERS: Record<LoanAddressField, (value: string) => string> = {
  houseBuilding: (value: string): string =>
    value.replace(/[^A-Za-z0-9 ,./#&()'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.houseBuilding),
  streetLocality: (value: string): string =>
    value.replace(/[^A-Za-z0-9 ,./#&()'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.streetLocality),
  city: (value: string): string =>
    value.replace(/[^A-Za-z .'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.city),
  pincode: (value: string): string =>
    value.replace(/\D/g, '').slice(0, ADDRESS_LIMITS.pincode),
  state: (value: string): string => value,
}

export interface AddressCopy {
  heading: string
  streetLabel: string
  housePlaceholder: string
  streetPlaceholder: string
  cityPlaceholder: string
  pincodePlaceholder: string
  statePlaceholder: string
}

export const CURRENT_ADDRESS_COPY: AddressCopy = {
  heading: 'Current Address',
  streetLabel: 'Street / Locality / Landmark',
  housePlaceholder: 'e.g. Flat 402, Sunrise Apartments',
  streetPlaceholder: 'e.g. MG Road, Near City Mall',
  cityPlaceholder: 'City / District',
  pincodePlaceholder: '6 digits',
  statePlaceholder: 'Select State',
}

export const PERMANENT_ADDRESS_COPY: AddressCopy = {
  heading: 'Permanent Address',
  streetLabel: 'Street / Locality',
  housePlaceholder: 'e.g. House No. 12',
  streetPlaceholder: 'e.g. Main Road',
  cityPlaceholder: 'City',
  pincodePlaceholder: '6 digits',
  statePlaceholder: 'Select Permanent State',
}

export const KYC_COPY = {
  verifiedTitle: 'Verified Customer Details',
  verifiedBadge: 'Details fetched from KYC',
  verifiedNote: 'Identity information fetched from verified KYC records cannot be edited.',
  addressTitle: 'Address Details',
  addressSubtitle: 'Provide your current communication and permanent address for lender verification.',
  sameAddressQuestion: 'Permanent Address same as Current Address?',
  consentTitle: 'Consent & Authorization',
  consentText:
    'I hereby authorize TaxEdge and its RBI-regulated lending partners to verify my KYC details (PAN & Aadhaar) and fetch my credit records for loan evaluation in compliance with RBI norms and the Digital Personal Data Protection (DPDP) Act.',
  securityNote: '256-bit encryption • Strictly confidential • Never shared without consent',
} as const

export const MSME_LOAN_SUCCESS = {
  serviceTitle: 'MSME Loan Application',
  successTitle: 'MSME Loan Application Submitted',
  successMessage:
    'Your application has been received. A TaxEdge MSME Credit Specialist will review your details and contact you shortly.',
} as const

export interface MsmeLoanDocConfig {
  id: string
  title: string
  description: string
  isRequired: boolean
  iconType: 'award' | 'file' | 'receipt'
}

export const MSME_LOAN_DOCUMENTS: MsmeLoanDocConfig[] = [
  {
    id: 'udyam_certificate',
    title: 'Udyam Registration Certificate',
    description: 'Official Udyam Registration Certificate issued by Ministry of MSME',
    isRequired: true,
    iconType: 'award',
  },
]

export const getMsmeLoanDocumentSections = (gstStatus?: string): {
  requiredDocs: MsmeLoanDocConfig[]
  optionalDocs: MsmeLoanDocConfig[]
} => {
  const requiredDocs: MsmeLoanDocConfig[] = [
    {
      id: 'udyam_certificate',
      title: 'Udyam Registration Certificate',
      description: 'Official Udyam Registration Certificate issued by Ministry of MSME',
      isRequired: true,
      iconType: 'award',
    },
  ]
  const optionalDocs: MsmeLoanDocConfig[] = []
  if (gstStatus === 'Registered') {
    optionalDocs.push({
      id: 'gst_certificate',
      title: 'GST Registration Certificate',
      description: 'Official GST Registration Certificate (Form GST REG-06)',
      isRequired: false,
      iconType: 'file',
    })
  }
  return { requiredDocs, optionalDocs }
}

