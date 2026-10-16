import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'
import type { LoanAddress, YesNoChoice } from '@modules/loans/types'

export type HomeLoanOccupation = 'salaried' | 'self-employed' | 'business-owner' | ''

export interface HomeLoanData {
  // Step 1: KYC Verification
  currentAddress: LoanAddress
  permanentSameAsCurrent: YesNoChoice
  permanentAddress: LoanAddress
  kycConsent: boolean

  // Step 2: Home Loan Requirement
  requestedLoanAmount: string
  loanPurpose: string
  propertyStatus: string
  approximatePropertyValue: string

  // Step 3: Property Documents
  uploadedDocs: Record<string, UploadedLoanDocument>

  // Step 4 / 5: Review & Terms
  termsAccepted: boolean

  // Backward compatibility fields
  loanAmount?: number | string
  propertyIntent?: string
  customPropertyIntent?: string
  repaymentTenureYears?: number
  propertyStage?: string
  estimatedPropertyCost?: string
  occupation?: HomeLoanOccupation
  monthlyIncomeRange?: string
  exactMonthlyIncome?: string
  hasExistingEmis?: boolean
  existingEmiAmount?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  itrStatus?: 'filed' | 'not-filed' | 'exempt' | ''
  itrAckNumber?: string
  annualIncomeAsPerItr?: string
}

export interface HomeLoanStepProps {
  data: HomeLoanData
  onChange: (fields: Partial<HomeLoanData>) => void
  errors?: Record<string, string>
}
