import type { KycStepData, LoanAddress } from '@modules/loans/types'
import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'

export type MsmeCategory = 'Micro' | 'Small' | 'Medium' | ''
export type MsmeEnterpriseType = 'Manufacturing' | 'Services' | 'Trading' | ''

export interface MsmeLoanData extends KycStepData {
  // Step 2: MSME & Business Details
  businessName?: string
  businessConstitution?: string
  businessActivity?: string
  establishmentDate?: string
  operatingAddress?: LoanAddress
  udyamStatus?: string
  udyamNumber?: string
  gstStatus?: string
  gstin?: string
  annualTurnover?: string
  avgMonthlySales?: string
  requestedLoanAmount?: string
  loanAmount?: string
  loanPurpose?: string
  businessVintage?: string
  msmeCategory?: string
  enterpriseType?: string

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
