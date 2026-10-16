import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'
import type { LoanAddress, YesNoChoice } from '@modules/loans/types'

export type PropertyLoanOwnershipType = 'sole' | 'joint'
export type PropertyLoanApplicantType = 'salaried' | 'self_employed_professional' | 'self_employed_business'

export interface PropertyLoanData {
  // Step 1: KYC Verification
  currentAddress: LoanAddress
  permanentSameAsCurrent: YesNoChoice
  permanentAddress: LoanAddress
  kycConsent: boolean

  // Step 2: Property & Loan Details
  requestedLoanAmount?: string
  loanPurpose?: string
  constructionStage?: string
  propertyType?: string
  city?: string
  state?: string
  pincode?: string
  propertyOwnership?: string

  // Legacy / subsequent steps
  titleHolderName?: string
  titleHolderMobile?: string
  titleHolderEmail?: string
  titleHolderPan?: string
  titleHolderAadhaar?: string
  titleHolderDob?: string
  titleHolderAddress?: string

  requiredAmount?: string
  tenureYears?: string
  applicantType?: PropertyLoanApplicantType | string
  isExistingCustomer?: boolean | null

  // Applicant & Income
  personalFullName?: string
  personalPan?: string
  personalMobile?: string
  personalDob?: string
  personalAddress?: string

  gender?: string
  maritalStatus?: string
  residenceType?: string
  yearsAtCurrentAddress?: string

  employerCategory?: string
  employerName?: string
  totalExperience?: string
  yearsInCurrentJob?: string
  annualIncome?: string

  hasExistingLoans?: boolean | null
  existingLoansDetails?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string

  // Property Details
  propertyPincode?: string
  propertyCity?: string
  propertyDistrict?: string
  propertyState?: string
  propertyAddress?: string
  propertyLandmark?: string

  propertySubType?: string
  constructionStatus?: string
  currentUsage?: string
  areaType?: string
  propertyArea?: string
  propertyAge?: string
  approvingAuthority?: string
  estimatedMarketValue?: string

  // Ownership
  ownershipType?: PropertyLoanOwnershipType
  coOwnerFullName?: string
  coOwnerRelationship?: string
  coOwnerPan?: string
  coOwnerMobile?: string

  currentLender?: string
  existingLoanType?: string
  outstandingLoanAmount?: string
  ownershipConfirmed?: boolean

  // Documents
  uploadedDocs?: Record<string, UploadedLoanDocument>

  // Review & Declaration
  declarationAgreed?: boolean
  inspectionAgreed?: boolean
  cibilConsentAgreed?: boolean
  termsAccepted?: boolean

  // Metadata
  applicationId?: string
  status?: 'draft' | 'submitted' | 'under_review' | 'approved'
  submittedAt?: string
}

export interface PropertyLoanStepProps {
  data: PropertyLoanData
  onChange: (fields: Partial<PropertyLoanData>) => void
  errors?: Record<string, string>
  onNext?: () => void
  onBack?: () => void
}
