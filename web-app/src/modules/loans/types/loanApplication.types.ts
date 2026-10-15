/** Applicant profile pulled from the signed-in account */
export interface ApplicantIdentityProfile {
  name: string
  mobile: string
  email: string
  pan: string
  aadhaar: string
  dob: string
  address: string
  isVerified: boolean
}

export type LoanApplicationStatusType =
  | 'draft'
  | 'submitted'
  | 'in-progress'
  | 'agent-review'
  | 'under-review'
  | 'sanctioned'
  | 'disbursed'
  | 'rejected'

export interface LoanMilestoneItem {
  id: string
  title: string
  timestamp?: string
  status: 'completed' | 'current' | 'pending'
}

export interface LoanApplicationBase {
  id: string
  refNumber: string
  referenceNumber?: string
  loanType: string
  loanCategory: string
  applicantName?: string
  loanAmount: number
  tenureYears: number
  tenureMonths?: number | string
  equipment?: string
  disbursementBank?: string
  loanAgent?: string
  status: LoanApplicationStatusType
  statusLabel: string
  createdAt: string
  updatedAt: string
  milestones: LoanMilestoneItem[]
  applicationData?: Record<string, unknown>
}
