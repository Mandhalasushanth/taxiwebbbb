import type { FinancingFacility, SelectOption } from '@modules/loans/types/businessWorkingCapital.types'

export const BUSINESS_PROFILE_LIMITS = {
  businessName: 150,
  operatingAddress: 250,
  pincode: 6,
  gstin: 15,
  udyam: 21,
  loanAmountDigits: 10,
  minLoanAmount: 25000,
  maxLoanAmount: 500000000,
  purposeDescriptionMin: 20,
  purposeDescriptionMax: 500,
  minMonthlyMetric: 1000,
  maxMonthlyMetric: 1000000000,
} as const

export interface FacilityOption {
  value: FinancingFacility
  title: string
  description: string
}

export const FACILITY_OPTIONS: FacilityOption[] = [
  {
    value: 'business-loan',
    title: 'Business Loan',
    description: 'Term loan for expansion, equipment & new setups.',
  },
  {
    value: 'working-capital',
    title: 'Working Capital',
    description: 'Revolving liquidity for inventory, bills & payroll.',
  },
]

export const CONSTITUTION_OPTIONS: SelectOption[] = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
  { value: 'private-limited', label: 'Private Limited Company' },
  { value: 'other', label: 'Other' },
]

export const BUSINESS_ACTIVITY_OPTIONS: SelectOption[] = [
  { value: 'trading', label: 'Trading' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
]

/** Purposes depend on the facility: a term loan funds assets, working capital funds operations */
export const LOAN_PURPOSE_OPTIONS: Record<FinancingFacility, SelectOption[]> = {
  'business-loan': [
    { value: 'business-expansion', label: 'Business Expansion' },
    { value: 'equipment-purchase', label: 'Equipment Purchase' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'inventory-purchase', label: 'Inventory Purchase' },
    { value: 'business-setup', label: 'Business Setup' },
    { value: 'other', label: 'Other' },
  ],
  'working-capital': [
    { value: 'inventory-purchase', label: 'Inventory Purchase' },
    { value: 'supplier-payments', label: 'Supplier Payments' },
    { value: 'receivables-gap', label: 'Receivables / Bills Gap' },
    { value: 'payroll', label: 'Payroll & Operating Expenses' },
    { value: 'seasonal-demand', label: 'Seasonal Demand' },
    { value: 'other', label: 'Other' },
  ],
}

export interface RequirementsCopy {
  title: string
  subtitle: string
  amountLabel: string
  amountPlaceholder: string
  amountHint: string
  purposeLabel: string
  purposePlaceholder: string
  descriptionLabel: string
  descriptionPlaceholder: string
}

export const REQUIREMENTS_COPY: Record<FinancingFacility, RequirementsCopy> = {
  'business-loan': {
    title: 'Business Term Loan Requirements',
    subtitle: 'Specify capital outlay and intended business asset deployment',
    amountLabel: 'Loan Amount Required',
    amountPlaceholder: 'e.g. 10,00,000',
    amountHint: 'Term loan amount required',
    purposeLabel: 'Purpose of Loan',
    purposePlaceholder: 'Select strategic loan objective',
    descriptionLabel: 'Brief Purpose Description',
    descriptionPlaceholder: 'Describe how the financing will be utilized to generate business returns',
  },
  'working-capital': {
    title: 'Working Capital Facility Details',
    subtitle: 'Operating cash flow requirements and monthly financial metrics',
    amountLabel: 'Working Capital Limit Required',
    amountPlaceholder: 'e.g. 5,00,000',
    amountHint: 'Overdraft / Cash credit limit required',
    purposeLabel: 'Purpose of Funds',
    purposePlaceholder: 'Select working capital requirement',
    descriptionLabel: 'Brief Description of Cash-Flow Need',
    descriptionPlaceholder: 'Briefly state operating cash-conversion cycles or immediate payable obligations',
  },
}


export const BUSINESS_PROFILE_COPY = {
  facilityHeading: 'Select Financing Facility',
  facilitySubtitle: 'Tailored terms based on your capital requirement structure',
  profileTitle: 'Business Profile',
  profileSubtitle: 'Official registered entity details and operational establishment',
  establishmentHint: 'Date of formal registration or commencement',
  gstQuestion: 'GST Registered Entity?',
  gstinHint: 'Verified against Goods & Services Tax network',
  udyamHint: 'Optional for MSME interest subsidy benefits',
  amountHint: `Minimum ₹${BUSINESS_PROFILE_LIMITS.minLoanAmount.toLocaleString('en-IN')}`,
} as const
