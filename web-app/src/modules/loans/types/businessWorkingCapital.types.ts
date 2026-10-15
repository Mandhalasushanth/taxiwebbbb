import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'

/** Yes / No answer that starts unselected */
export type YesNoChoice = 'yes' | 'no' | ''

/** One postal address as captured in the KYC step */
export interface LoanAddress {
  houseBuilding: string
  streetLocality: string
  city: string
  pincode: string
  state: string
}

export type LoanAddressField = keyof LoanAddress

/** Read-only identity details fetched from the customer's verified KYC */
export interface VerifiedCustomerDetails {
  fullName: string
  mobile: string
  email: string
  pan: string
  aadhaar: string
  dob: string
  isVerified: boolean
}

export type FinancingFacility = 'business-loan' | 'working-capital'

export interface BusinessWorkingCapitalFormData {
  // Step 1: KYC Verification
  currentAddress: LoanAddress
  permanentSameAsCurrent: YesNoChoice
  permanentAddress: LoanAddress
  kycConsent: boolean

  // Step 2: Business Profile
  financingFacility: FinancingFacility
  businessName: string
  businessConstitution: string
  businessActivity: string
  establishmentDate: string
  operatingAddress: string
  businessPincode: string
  gstRegistered: YesNoChoice
  gstin: string
  udyamNumber: string
  loanAmount: string
  loanPurpose: string
  purposeDescription: string
  avgMonthlySales: string
  avgMonthlyExpenses: string

  // Step 3: Documents
  uploadedDocs: Record<string, UploadedLoanDocument>

  // Step 4: Review & Submit
  termsAccepted: boolean
}

export interface SelectOption {
  value: string
  label: string
}

/** Address + consent fields captured by the shared KYC step (used by several loan flows) */
export type KycStepData = Pick<
  BusinessWorkingCapitalFormData,
  'currentAddress' | 'permanentSameAsCurrent' | 'permanentAddress' | 'kycConsent'
>

export interface KycStepProps {
  data: KycStepData
  onChange: (fields: Partial<KycStepData>) => void
  errors?: Record<string, string>
}

export interface BusinessWorkingCapitalStepProps {
  data: BusinessWorkingCapitalFormData
  onChange: (fields: Partial<BusinessWorkingCapitalFormData>) => void
  errors?: Record<string, string>
}

