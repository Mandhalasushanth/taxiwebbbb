import { routePaths } from '@core/config'
import { INDIAN_STATE_DROPDOWN_OPTIONS } from '@shared/services/indianStates'
import type { FlowStepItem } from '@shared/components'
import type { MachineryLoanData } from '@modules/loans/types/machineryLoan.types'
import type { LoanAddress, LoanAddressField } from '@modules/loans/types'

export const MACHINERY_LOAN_TITLE = 'Machinery Loan'
export const MACHINERY_LOAN_TYPE = 'machinery_loan'
export const MACHINERY_LOAN_RESUME_ROUTE = routePaths.loansMachineryLoan

export const MACHINERY_LOAN_STEPS: FlowStepItem[] = [
  { stepNumber: 1, title: 'KYC Verification', shortLabel: 'KYC' },
  { stepNumber: 2, title: 'Loan Details', shortLabel: 'Loan Details' },
  { stepNumber: 3, title: 'Business Details', shortLabel: 'Business' },
  { stepNumber: 4, title: 'Banking', shortLabel: 'Banking' },
  { stepNumber: 5, title: 'Documents & Review', shortLabel: 'Documents' },
]

export const MACHINERY_LOAN_FORM_STEP_COUNT = 5

export const EMPTY_ADDRESS: LoanAddress = {
  houseBuilding: '',
  streetLocality: '',
  city: '',
  pincode: '',
  state: '',
}

export const INITIAL_MACHINERY_LOAN_DATA: MachineryLoanData = {
  // Step 1: KYC Verification
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: 'yes',
  permanentAddress: EMPTY_ADDRESS,
  kycConsent: false,

  // Step 2: Loan Details
  loanAmount: '',
  machineryType: '',
  repaymentTenure: '',

  // Step 3: Business Details
  businessName: '',
  businessType: 'Proprietorship',
  businessVintage: '1–3 years',
  annualTurnover: '',
  isGstRegistered: true,
  gstin: '',

  // Step 4: Banking
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',

  // Step 5: Documents & Review
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
    value
      .replace(/[^A-Za-z0-9 ,./#&()'-]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trimStart()
      .slice(0, ADDRESS_LIMITS.houseBuilding),
  streetLocality: (value: string): string =>
    value
      .replace(/[^A-Za-z0-9 ,./#&()'-]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trimStart()
      .slice(0, ADDRESS_LIMITS.streetLocality),
  city: (value: string): string =>
    value
      .replace(/[^A-Za-z .'-]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trimStart()
      .slice(0, ADDRESS_LIMITS.city),
  pincode: (value: string): string => value.replace(/\D/g, '').slice(0, ADDRESS_LIMITS.pincode),
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
