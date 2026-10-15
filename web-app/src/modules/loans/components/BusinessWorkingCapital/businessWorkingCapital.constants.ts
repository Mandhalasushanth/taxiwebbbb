import { routePaths } from '@core/config'
import { INDIAN_STATE_DROPDOWN_OPTIONS } from '@shared/services/indianStates'
import type { FlowStepItem } from '@shared/components'
import type {
  BusinessWorkingCapitalFormData,
  LoanAddress,
  LoanAddressField,
} from '@modules/loans/types/businessWorkingCapital.types'

export const BWC_TITLE = 'Business & Working Capital Loans'
export const BWC_LOAN_TYPE = 'business_working_capital_loan'
export const BWC_RESUME_ROUTE = routePaths.loansBusinessWorkingCapital

export const BWC_STEPS: FlowStepItem[] = [
  { stepNumber: 1, title: 'KYC Verification', shortLabel: 'KYC' },
  { stepNumber: 2, title: 'Business Details', shortLabel: 'Business' },
  { stepNumber: 3, title: 'Documents', shortLabel: 'Documents' },
  { stepNumber: 4, title: 'Review', shortLabel: 'Review' },
  { stepNumber: 5, title: 'Submit', shortLabel: 'Submit' },
]

/** Steps the customer fills in; step 5 (Submit) is reached once the application is sent */
export const BWC_FORM_STEP_COUNT = 4

export const EMPTY_ADDRESS: LoanAddress = {
  houseBuilding: '',
  streetLocality: '',
  city: '',
  pincode: '',
  state: '',
}

export const INITIAL_BWC_DATA: BusinessWorkingCapitalFormData = {
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: 'yes',
  permanentAddress: EMPTY_ADDRESS,
  kycConsent: false,
  financingFacility: 'business-loan',
  businessName: '',
  businessConstitution: '',
  businessActivity: '',
  establishmentDate: '',
  operatingAddress: '',
  businessPincode: '',
  gstRegistered: 'no',
  gstin: '',
  udyamNumber: '',
  loanAmount: '',
  loanPurpose: '',
  purposeDescription: '',
  avgMonthlySales: '',
  avgMonthlyExpenses: '',
  uploadedDocs: {},
  termsAccepted: false,
}

/** Changing one of these clears the listed dependent errors */
export const BWC_RELATED_ERROR_KEYS: Record<string, string[]> = {
  gstRegistered: ['gstin'],
  businessPincode: ['gstin'],
  financingFacility: ['loanPurpose', 'loanAmount'],
}

export const STATE_OPTIONS = INDIAN_STATE_DROPDOWN_OPTIONS

export const ADDRESS_LIMITS = { houseBuilding: 120, streetLocality: 150, city: 60, pincode: 6 } as const

/** Typing filters: only characters valid for each address field reach the form */
export const ADDRESS_INPUT_FILTERS: Record<LoanAddressField, (value: string) => string> = {
  houseBuilding: (v) => v.replace(/[^A-Za-z0-9 ,./#&()'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.houseBuilding),
  streetLocality: (v) => v.replace(/[^A-Za-z0-9 ,./#&()'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.streetLocality),
  city: (v) => v.replace(/[^A-Za-z .'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.city),
  pincode: (v) => v.replace(/\D/g, '').slice(0, ADDRESS_LIMITS.pincode),
  state: (v) => v,
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
  cityPlaceholder: 'City',
  pincodePlaceholder: '6 digits',
  statePlaceholder: 'Select State / UT',
}

export const PERMANENT_ADDRESS_COPY: AddressCopy = {
  heading: 'Permanent Address',
  streetLabel: 'Street / Locality',
  housePlaceholder: 'e.g. House No. 12',
  streetPlaceholder: 'e.g. Main Road',
  cityPlaceholder: 'City',
  pincodePlaceholder: '6 digits',
  statePlaceholder: 'Select Permanent State / UT',
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

export const BWC_SUCCESS = {
  serviceTitle: 'Business & Working Capital Loan Application',
  successTitle: 'Loan Application Submitted',
  successMessage:
    'Your application has been received. A TaxEdge Loan Advisor will review your details and contact you shortly.',
} as const
