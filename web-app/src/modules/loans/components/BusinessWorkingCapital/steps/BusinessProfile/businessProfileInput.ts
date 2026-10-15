import type { BusinessWorkingCapitalFormData } from '@modules/loans/types/businessWorkingCapital.types'
import { BUSINESS_PROFILE_LIMITS as L } from './businessProfile.constants'

type TextFieldKey =
  | 'businessName'
  | 'operatingAddress'
  | 'businessPincode'
  | 'gstin'
  | 'udyamNumber'
  | 'loanAmount'
  | 'purposeDescription'
  | 'avgMonthlySales'
  | 'avgMonthlyExpenses'

const collapseSpaces = (value: string) => value.replace(/\s{2,}/g, ' ').trimStart()

/** Indian grouping while typing: 1000000 -> "10,00,000" */
export const formatAmount = (value: string): string => {
  const digits = value.replace(/\D/g, '').replace(/^0+/, '').slice(0, L.loanAmountDigits)
  return digits ? Number(digits).toLocaleString('en-IN') : ''
}

/** Typing filters: only characters valid for each Step 2 field reach the form */
export const BUSINESS_PROFILE_INPUT: Record<TextFieldKey, (value: string) => string> = {
  businessName: (v) => collapseSpaces(v.replace(/[^A-Za-z0-9 .&'()/,-]/g, '')).slice(0, L.businessName),
  operatingAddress: (v) => collapseSpaces(v.replace(/[^A-Za-z0-9 ,./#&()'\n-]/g, '')).slice(0, L.operatingAddress),
  businessPincode: (v) => v.replace(/\D/g, '').slice(0, L.pincode),
  gstin: (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, L.gstin),
  udyamNumber: (v) => v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, L.udyam),
  loanAmount: formatAmount,
  purposeDescription: (v) => v.replace(/\n{3,}/g, '\n\n').trimStart().slice(0, L.purposeDescriptionMax),
  avgMonthlySales: formatAmount,
  avgMonthlyExpenses: formatAmount,
}


export type BusinessProfileTextField = TextFieldKey
export type BusinessProfileChange = (fields: Partial<BusinessWorkingCapitalFormData>) => void

/** Today as YYYY-MM-DD, the latest allowed establishment date */
export const todayIso = (): string => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
