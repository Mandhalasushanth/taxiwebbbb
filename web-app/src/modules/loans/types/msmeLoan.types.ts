import type { KycStepData } from '@modules/loans/types'
import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'

export type MsmeCategory = 'Micro' | 'Small' | 'Medium' | ''
export type MsmeEnterpriseType = 'Manufacturing' | 'Services' | 'Trading' | ''

export interface MsmeLoanData extends KycStepData {
  // Step 2: MSME & Loan Requirements (for future step 2)
  requestedLoanAmount?: string
  loanAmount?: string
  msmeCategory?: string
  enterpriseType?: string
  businessName?: string
  udyamNumber?: string
  businessVintage?: string
  annualTurnover?: string

  // Step 3: Documents
  uploadedDocs?: Record<string, UploadedLoanDocument>

  // Step 4: Review Declarations
  termsAccepted?: boolean
}

export type MsmeLoanFormData = MsmeLoanData

export interface MsmeLoanStepProps {
  data: MsmeLoanData
  onChange: (patch: Partial<MsmeLoanData>) => void
  errors?: Record<string, string>
}
