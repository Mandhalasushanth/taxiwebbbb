import { routePaths } from '@core/config'
import { INDIAN_STATE_DROPDOWN_OPTIONS } from '@shared/services/indianStates'
import type { FlowStepItem } from '@shared/components'
import type { HomeLoanData } from '@modules/loans/types/homeLoan.types'
import type { LoanAddress, LoanAddressField } from '@modules/loans/types'

export const HOME_LOAN_TITLE = 'Home Loan'
export const HOME_LOAN_TYPE = 'home_loan'
export const HOME_LOAN_RESUME_ROUTE = routePaths.loansHomeLoan

export const HOME_LOAN_STEPS: FlowStepItem[] = [
  { stepNumber: 1, title: 'KYC Verification', shortLabel: 'KYC' },
  { stepNumber: 2, title: 'Home Loan Requirement', shortLabel: 'Requirement' },
  { stepNumber: 3, title: 'Property Documents', shortLabel: 'Documents' },
  { stepNumber: 4, title: 'Review & Submit', shortLabel: 'Review' },
  { stepNumber: 5, title: 'Application Submitted', shortLabel: 'Submitted' },
]

export const HOME_LOAN_FORM_STEP_COUNT = 4

export const EMPTY_ADDRESS: LoanAddress = {
  houseBuilding: '',
  streetLocality: '',
  city: '',
  pincode: '',
  state: '',
}

export const INITIAL_HOME_LOAN_DATA: HomeLoanData = {
  // Step 1: KYC Verification
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: 'yes',
  permanentAddress: EMPTY_ADDRESS,
  kycConsent: false,

  // Step 2: Home Loan Requirement
  requestedLoanAmount: '',
  loanPurpose: '',
  propertyStatus: '',
  approximatePropertyValue: '',

  // Step 3: Property Documents
  uploadedDocs: {},

  // Step 4 / 5: Submit
  termsAccepted: false,
}

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

// Step 2: What do you need the loan for?
export const LOAN_PURPOSE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'Purchase a New Home', label: 'Purchase a New Home' },
  { value: 'Purchase a Resale Home', label: 'Purchase a Resale Home' },
  { value: 'Construct a House', label: 'Construct a House' },
  { value: 'Home Renovation', label: 'Home Renovation' },
  { value: 'Balance Transfer', label: 'Balance Transfer' },
] as const

// Step 2: Property Status
export const PROPERTY_STATUS_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'Property Identified', label: 'Property Identified' },
  { value: 'Looking for Property', label: 'Looking for Property' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: 'Ready to Move', label: 'Ready to Move' },
] as const

// Step 3: Document Configurations
export interface HomeLoanDocConfig {
  id: string
  title: string
  description: string
  isRequired: boolean
  iconType: 'home' | 'receipt' | 'file' | 'folder'
}

export const HOME_LOAN_REQUIRED_DOCUMENTS: readonly HomeLoanDocConfig[] = [
  {
    id: 'property_sale_agreement',
    title: 'Property / Sale Agreement Document',
    description: 'Upload the property document available with you.',
    isRequired: true,
    iconType: 'home',
  },
  {
    id: 'bank_statement_income',
    title: 'Bank Statement / Income Document',
    description: 'Latest 6 months bank statement showing regular credits or operational funds',
    isRequired: true,
    iconType: 'receipt',
  },
] as const

export const HOME_LOAN_OPTIONAL_DOCUMENTS: readonly HomeLoanDocConfig[] = [
  {
    id: 'property_quotation_builder',
    title: 'Property Quotation / Builder Document',
    description: 'Builder quotation, cost sheet or demand letter if available',
    isRequired: false,
    iconType: 'file',
  },
  {
    id: 'additional_property_doc',
    title: 'Additional Property Document',
    description: 'Any other property records, tax receipts or possession letters',
    isRequired: false,
    iconType: 'folder',
  },
] as const

export const getHomeLoanDocumentSections = () => ({
  requiredDocs: HOME_LOAN_REQUIRED_DOCUMENTS,
  optionalDocs: HOME_LOAN_OPTIONAL_DOCUMENTS,
})

export const HOME_LOAN_SUCCESS = {
  serviceTitle: 'Home Loan Application',
  successTitle: 'Home Loan Submitted',
  successMessage:
    'Your Home Loan application has been successfully received. A TaxEdge Loan Advisor will review your documents and contact you shortly.',
} as const
