import type { LoanAddress, YesNoChoice } from '@modules/loans/types'
import type { UploadedLoanDocument } from '@modules/loans/documents/loanDocument.types'

export type MachineryType =
  | 'Manufacturing Machinery'
  | 'Construction Machinery'
  | 'Agricultural Machinery'
  | 'Medical Equipment'
  | 'Printing Machinery'
  | 'Packaging Machinery'
  | 'Textile Machinery'
  | 'Food Processing Machinery'
  | 'CNC / Industrial Machinery'
  | 'Other'
  | ''

export type MachineryEquipmentType =
  | MachineryType
  | 'CNC / Automation Machinery'
  | 'Printing / Packaging Machinery'

export type MachineryCondition = 'New' | 'Used / Pre-owned' | ''

export type MachineryPurchaseType =
  | 'Direct from Manufacturer'
  | 'Authorized Dealer'
  | 'Other Supplier'
  | ''

export type MachineryLoanRepaymentTenure =
  | '12 Months'
  | '24 Months'
  | '36 Months'
  | '48 Months'
  | '60 Months'
  | '72 Months'
  | '84 Months'
  | ''

export type MachineryBusinessType =
  | 'Proprietorship'
  | 'Partnership'
  | 'LLP'
  | 'Private Limited'
  | 'Other'
  | ''

export type MachineryBusinessVintage =
  | 'Less than 1 year'
  | '1–3 years'
  | '3–5 years'
  | '5–10 years'
  | '10+ years'
  | ''

export interface MachineryLoanStepProps {
  data: MachineryLoanData
  onChange: (patch: Partial<MachineryLoanData>) => void
  errors?: Record<string, string>
}

export interface MachineryLoanData {
  // Step 1: KYC Verification
  currentAddress: LoanAddress
  permanentSameAsCurrent: YesNoChoice
  permanentAddress: LoanAddress
  kycConsent: boolean

  // Step 2: Machinery & Loan Details
  requestedLoanAmount?: string
  loanAmount: number | string
  machineryType: MachineryType | string
  machineryNameDescription?: string
  machineryName?: string
  machineryCondition?: MachineryCondition
  machineryPurchaseType?: MachineryPurchaseType
  purchaseType?: string
  approximateMachineryCost?: string | number
  machineryCost?: string | number
  dealerSupplierName?: string
  dealerName?: string
  repaymentTenure?: MachineryLoanRepaymentTenure

  // Step 3: Business Details
  businessName?: string
  businessType?: MachineryBusinessType
  businessVintage?: MachineryBusinessVintage
  annualTurnover?: string
  isGstRegistered?: boolean
  gstin?: string

  // Step 4: Banking
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  branchName?: string

  // Step 5: Documents & Review
  uploadedDocs: Record<string, UploadedLoanDocument>
  termsAccepted: boolean
}
