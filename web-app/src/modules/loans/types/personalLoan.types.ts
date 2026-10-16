import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'
import type { KycStepData } from './businessWorkingCapital.types'

export type EmploymentType = 'salaried' | 'self-employed' | ''

export interface PersonalLoanFormData extends KycStepData {
  // Step 2: Loan Requirement & Employment Details
  requestedLoanAmount: string
  employmentType: EmploymentType
  employerName: string
  jobType: string
  monthlySalary: string
  workExperience: string
  salaryReceivedMode: string

  // Step 3: Documents
  uploadedDocs: Record<string, UploadedLoanDocument>

  // Step 4: Review Declarations
  termsAccepted: boolean
}

export type PersonalLoanData = PersonalLoanFormData

export interface PersonalLoanStepProps {
  data: PersonalLoanFormData
  onChange: (fields: Partial<PersonalLoanFormData>) => void
  errors?: Record<string, string>
}
