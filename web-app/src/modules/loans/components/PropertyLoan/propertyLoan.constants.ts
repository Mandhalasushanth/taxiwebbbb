import { routePaths } from '@core/config'
import { INDIAN_STATE_DROPDOWN_OPTIONS } from '@shared/services/indianStates'
import type { FlowStepItem } from '@shared/components'
import type { PropertyLoanData } from '@modules/loans/types/propertyLoan.types'
import type { LoanAddress, LoanAddressField } from '@modules/loans/types'

export const PROPERTY_LOAN_TITLE = 'Property Loan'
export const PROPERTY_LOAN_TYPE = 'property_loan'
export const PROPERTY_LOAN_RESUME_ROUTE = routePaths.loansPropertyLoan

export const PROPERTY_LOAN_STEPS: FlowStepItem[] = [
  { stepNumber: 1, title: 'KYC Verification', shortLabel: 'KYC' },
  { stepNumber: 2, title: 'Property & Loan Details', shortLabel: 'Property Details' },
  { stepNumber: 3, title: 'Property Documents', shortLabel: 'Documents' },
  { stepNumber: 4, title: 'Review & Submit', shortLabel: 'Review' },
  { stepNumber: 5, title: 'Application Submitted', shortLabel: 'Submitted' },
]

export const PROPERTY_LOAN_FORM_STEP_COUNT = 4

export const EMPTY_ADDRESS: LoanAddress = {
  houseBuilding: '',
  streetLocality: '',
  city: '',
  pincode: '',
  state: '',
}

export const INITIAL_PROPERTY_LOAN_DATA: PropertyLoanData = {
  // Step 1: KYC Verification
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: 'yes',
  permanentAddress: EMPTY_ADDRESS,
  kycConsent: false,

  // Step 2: Property & Loan Details
  requestedLoanAmount: '',
  loanPurpose: '',
  propertyType: '',
  city: '',
  state: '',
  pincode: '',
  propertyOwnership: '',

  // Steps 3+ fields
  uploadedDocs: {},
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

// Step 2: Purpose of Loan Options from screenshot
export const PURPOSE_OF_LOAN_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'Home Purchase', label: 'Home Purchase' },
  { value: 'Home Construction', label: 'Home Construction' },
  { value: 'Home Renovation', label: 'Home Renovation' },
  { value: 'Plot Purchase', label: 'Plot Purchase' },
  { value: 'Plot + Construction', label: 'Plot + Construction' },
  { value: 'Balance Transfer', label: 'Balance Transfer' },
  { value: 'Other', label: 'Other' },
] as const

// Step 2: Property Type Options from screenshot
export const PROPERTY_TYPE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'Apartment / Flat', label: 'Apartment / Flat' },
  { value: 'Independent House', label: 'Independent House' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Plot', label: 'Plot' },
  { value: 'Commercial Property', label: 'Commercial Property' },
  { value: 'Other', label: 'Other' },
] as const

// Step 2: Property Ownership Options from screenshot
export const PROPERTY_OWNERSHIP_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'Self', label: 'Self' },
  { value: 'Joint / Family', label: 'Joint / Family' },
  { value: 'Not Yet Purchased', label: 'Not Yet Purchased' },
] as const

// Step 2: Construction Stage Options (shown when Home Construction / Plot + Construction is selected)
export const CONSTRUCTION_STAGE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'Planning Stage', label: 'Planning Stage' },
  { value: 'Foundation Stage', label: 'Foundation Stage' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: 'Finishing Stage', label: 'Finishing Stage' },
  { value: 'Completed', label: 'Completed' },
] as const

// Step 3: Document Configurations
export interface PropertyLoanDocConfig {
  id: string
  title: string
  description: string
  isRequired: boolean
  iconType: 'shield' | 'tools' | 'map' | 'calculator' | 'folder'
}

export const PROPERTY_LOAN_REQUIRED_DOCUMENTS: readonly PropertyLoanDocConfig[] = [
  {
    id: 'property_ownership',
    title: 'Property Ownership Document',
    description: 'Title deed, allotment letter or land ownership proof',
    isRequired: true,
    iconType: 'shield',
  },
] as const

export const PROPERTY_LOAN_OPTIONAL_DOCUMENTS: readonly PropertyLoanDocConfig[] = [
  {
    id: 'construction_doc',
    title: 'Construction Document (If Available)',
    description: 'Contractor agreement, quotation or estimate if available',
    isRequired: false,
    iconType: 'tools',
  },
  {
    id: 'sanctioned_plan',
    title: 'Sanctioned Building Plan',
    description: 'Approved architectural plan or municipal sanctioned layout',
    isRequired: false,
    iconType: 'map',
  },
  {
    id: 'cost_estimate',
    title: 'Construction Cost Estimate',
    description: 'Civil work estimate or architect valuation',
    isRequired: false,
    iconType: 'calculator',
  },
  {
    id: 'additional_doc',
    title: 'Additional Property Document',
    description: 'Any additional land records or construction permits',
    isRequired: false,
    iconType: 'folder',
  },
] as const

export const getPropertyLoanDocumentSections = () => ({
  requiredDocs: PROPERTY_LOAN_REQUIRED_DOCUMENTS,
  optionalDocs: PROPERTY_LOAN_OPTIONAL_DOCUMENTS,
})

export const PROPERTY_LOAN_SUCCESS = {
  serviceTitle: 'Property Loan Application',
  successTitle: 'Property Loan Submitted',
  successMessage:
    'Your Property Loan application has been successfully received. A TaxEdge Loan Advisor will review your property dossier and contact you shortly.',
} as const
