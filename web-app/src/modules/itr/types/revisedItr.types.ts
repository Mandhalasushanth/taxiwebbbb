export type AssessmentYear = 'AY 2025-26' | 'AY 2024-25' | 'AY 2023-24'

export const AY_OPTIONS: AssessmentYear[] = ['AY 2025-26', 'AY 2024-25', 'AY 2023-24']

export type RevisionReasonKey =
  | 'missed_income'
  | 'wrong_deduction'
  | 'incorrect_bank'
  | 'other'

export interface RevisionReasonOption {
  key: RevisionReasonKey
  title: string
  subtitle: string
  icon: 'income' | 'deduction' | 'bank' | 'other'
}

export interface FindOriginalReturnPayload {
  ackNumber: string
  assessmentYear: string
}

export interface PersonalInfoDetails {
  fullName: string
  pan: string
  dob: string
  mobile: string
  email: string
  address: string
}

export interface OriginalReturnDetails {
  status: string
  assessmentYear: string
  itrForm: string
  grossTotalIncome: string
  salaryOriginal?: number
  otherOriginal?: number
  taxableOriginal?: number
  deductionsOriginal?: number
  taxesPaidOriginal?: number
  personalInfo?: PersonalInfoDetails
}

export interface IncomeCorrectionState {
  salaryIncome: string
  otherIncome: string
  taxableIncome: string
}

export interface DeductionCorrectionState {
  section80c: string
  section80d: string
  homeLoanInterest: string
  taxableIncome: string
}

export interface BankCorrectionState {
  accountNumber: string
  ifsc: string
}

export interface IncomeCorrectionOriginals {
  salaryOriginal: number
  otherOriginal: number
  taxableOriginal: number
}

export interface DeductionCorrectionOriginals {
  section80cOriginal: number
  section80dOriginal: number
  homeLoanInterestOriginal: number
  taxableOriginal: number
}

export type DocumentTypeId =
  | 'pan'
  | 'aadhaar'
  | 'form16'
  | 'ais_tis'
  | 'bank_statement'
  | 'investment_proof'

export interface UploadedDocument {
  id: DocumentTypeId
  fileName: string
  fileSize: string
  uploadedAt: string
  file?: File
}

export interface DocumentSlotConfig {
  id: DocumentTypeId
  title: string
  isRequired: boolean
  tag: string
}

export interface RevisedItrFormState {
  step: 1 | 2 | 3 | 4 | 5
  ackNumber: string
  selectedAy: string
  isReturnFound: boolean
  returnDetails: OriginalReturnDetails | null
  selectedReason: RevisionReasonKey | null
  otherReasonText: string
  incomeCorrections: IncomeCorrectionState
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
  isLoading: boolean
}

export interface RevisedItrValidationErrors {
  ackError?: string | null
  ayError?: string | null
  reasonError?: string | null
  otherReasonError?: string | null
  salaryIncomeError?: string | null
  taxableIncomeError?: string | null
  bankAccountError?: string | null
  ifscError?: string | null
  documentsError?: string | null
}
