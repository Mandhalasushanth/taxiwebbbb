import { routePaths } from '@core/config'
import { INDIAN_STATE_DROPDOWN_OPTIONS } from '@shared/services/indianStates'
import type { FlowStepItem } from '@shared/components'
import type {
  EmploymentType,
  PersonalLoanFormData,
} from '@modules/loans/types/personalLoan.types'
import type { LoanAddress, LoanAddressField } from '@modules/loans/types'

export const PERSONAL_LOAN_TITLE = 'Personal Loan'
export const PERSONAL_LOAN_TYPE = 'personal_loan'
export const PERSONAL_LOAN_RESUME_ROUTE = routePaths.loansPersonalLoan

export const PERSONAL_LOAN_STEPS: FlowStepItem[] = [
  { stepNumber: 1, title: 'KYC Verification', shortLabel: 'KYC' },
  { stepNumber: 2, title: 'Employment & Income', shortLabel: 'Employment' },
  { stepNumber: 3, title: 'Documents', shortLabel: 'Documents' },
  { stepNumber: 4, title: 'Review', shortLabel: 'Review' },
  { stepNumber: 5, title: 'Submit', shortLabel: 'Submit' },
]

export const PERSONAL_LOAN_FORM_STEP_COUNT = 4

export const EMPTY_ADDRESS: LoanAddress = {
  houseBuilding: '',
  streetLocality: '',
  city: '',
  pincode: '',
  state: '',
}

export const INITIAL_PERSONAL_LOAN_DATA: PersonalLoanFormData = {
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: 'yes',
  permanentAddress: EMPTY_ADDRESS,
  kycConsent: false,
  requestedLoanAmount: '',
  employmentType: 'salaried',
  employerName: '',
  jobType: '',
  monthlySalary: '',
  workExperience: '',
  salaryReceivedMode: 'Bank Account',
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

// Step 2 Employment & Income Options
export const JOB_TYPE_OPTIONS: readonly string[] = [
  'Private',
  'Government',
  'Public Sector',
  'Self-Employed Professional',
  'Other',
] as const

export const WORK_EXPERIENCE_OPTIONS: readonly string[] = [
  'Less than 1 year',
  '1 - 3 Years',
  '3 - 5 Years',
  '5 - 10 Years',
  '10+ Years',
] as const

export const SALARY_RECEIVE_OPTIONS: readonly string[] = [
  'Bank Account',
  'Cash',
  'Cheque',
] as const

export const SELF_EMPLOYED_BUSINESS_TYPES: readonly string[] = [
  'Trading',
  'Services',
  'Manufacturing',
  'Retail',
  'Professional',
  'Other',
] as const

export interface PersonalLoanDocConfig {
  id: string
  title: string
  description: string
  badge: 'Required' | 'Optional'
  isRequired: boolean
  iconType: 'pan' | 'bank' | 'itr'
}

export interface PersonalLoanStep3Docs {
  requiredDocs: readonly PersonalLoanDocConfig[]
  optionalDocs: readonly PersonalLoanDocConfig[]
}

/** Dynamic document sections based on Step 2 Employment Type selection */
export const getPersonalLoanDocumentSections = (
  employmentType: EmploymentType,
): PersonalLoanStep3Docs => {
  const panDoc: PersonalLoanDocConfig = {
    id: 'pan_card',
    title: 'Applicant PAN Card',
    description: 'PAN card for identity and credit bureau evaluation',
    badge: 'Required',
    isRequired: true,
    iconType: 'pan',
  }

  if (employmentType === 'self-employed') {
    return {
      requiredDocs: [panDoc],
      optionalDocs: [
        {
          id: 'business_bank_statement',
          title: 'Bank Statement (Last 6 Months)',
          description: 'Operational bank statement showing profession or business inflows',
          badge: 'Optional',
          isRequired: false,
          iconType: 'bank',
        },
        {
          id: 'itr_acknowledgment',
          title: 'ITR Acknowledgment / Computation (Optional)',
          description: 'Latest ITR filing acknowledgment (optional, does not block loan sanction)',
          badge: 'Optional',
          isRequired: false,
          iconType: 'itr',
        },
      ],
    }
  }

  return {
    requiredDocs: [
      panDoc,
      {
        id: 'salary_bank_statement',
        title: 'Salary Bank Statement (Last 3 Months)',
        description: 'Latest 3 months salary account statement showing regular credits',
        badge: 'Required',
        isRequired: true,
        iconType: 'bank',
      },
    ],
    optionalDocs: [],
  }
}

/** Returns only the mandatory documents for step progression */
export const getRequiredPersonalLoanDocuments = (
  employmentType: EmploymentType,
): readonly PersonalLoanDocConfig[] =>
  getPersonalLoanDocumentSections(employmentType).requiredDocs

export const PERSONAL_LOAN_SUCCESS = {
  serviceTitle: 'Personal Loan Application',
  successTitle: 'Personal Loan Application Submitted',
  successMessage:
    'Your application has been received. A TaxEdge Loan Advisor will review your details and contact you shortly.',
} as const
