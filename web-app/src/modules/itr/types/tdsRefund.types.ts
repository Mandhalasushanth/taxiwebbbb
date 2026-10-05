export interface TdsProfile {
  name: string
  fullName: string
  pan: string
  aadhaar: string
  dob: string
  mobile: string
  email: string
  address: string
  preliminaryRefund: string
  assessmentYear: string
  defaultAccountHolder: string
  defaultAccountNumber: string
  defaultIfsc: string
  defaultBankName: string
}

export interface TdsBankDetails {
  accountHolder: string
  accountNumber: string
  confirmAccountNumber: string
  ifsc: string
  bankName: string
  branch: string
  accountType: 'savings' | 'current' | null
}

export interface TdsIncomeTaxData {
  taxRegime: 'old' | 'new' | null
  salaryIncome: string
  otherIncome: string
  interestIncome: string
  rentalIncome: 'yes' | 'no' | null
  capitalGains: 'yes' | 'no' | null
  businessIncome: 'yes' | 'no' | null
  homeLoanInterest: 'yes' | 'no' | null
  taxDeductions: 'yes' | 'no' | null
  annualRent: string
  propertyTaxes: string
  stcg: string
  ltcg: string
  turnover: string
  netProfit: string
  homeLoanInterestAmount: string
  deduction80C: string
  deduction80D: string
  totalTdsDeducted: string
  tcsAmount: string
  advanceTax: string
  selfAssessmentTax: string
}

export interface UploadedFileMeta {
  name: string
  size: string
  id?: string
  file?: File
  previewUrl?: string
  progress?: number
  uploadedAt?: string
}
