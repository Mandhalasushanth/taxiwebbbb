import React from 'react'
import {
  CheckCircle2,
  Clock as LucideClock,
  FileText as LucideFileText,
  Upload as LucideUpload,
  User as LucideUser,
  Landmark,
  Briefcase as LucideBriefcase,
  Percent as LucidePercent,
  TrendingUp as LucideTrendingUp,
  ChevronRight as LucideChevronRight,
  AlertCircle as LucideAlertCircle,
  PlusCircle as LucidePlusCircle,
  Info,
  Check,
  ShieldCheck,
  Zap as LucideZap,
  Pencil,
  Lock as LucideLock,
  CreditCard as LucideCreditCard,
  IndianRupee,
  Calculator as LucideCalculator,
  MessageCircle as LucideMessageCircle,
  Wallet,
} from 'lucide-react'
import type { TdsProfile, TdsBankDetails, TdsBusinessDetails, TdsIncomeTaxData } from '../types/tdsRefund.types'
import { errorTracker } from '@core/errors'

const createCustomSvgIcon =
  (src: string, defaultSize = 20): React.FC<{ size?: number; width?: number; height?: number; color?: string; className?: string }> =>
  ({ size = defaultSize, width, height, className = '' }) =>
    React.createElement('img', {
      src,
      width: width ?? size,
      height: height ?? size,
      className,
      alt: '',
      'aria-hidden': true,
    })

export const CheckCircle = CheckCircle2
export const Clock = LucideClock
export const FileText = LucideFileText
export const Upload = LucideUpload
export const User = LucideUser
export const Building = Landmark
export const Briefcase = LucideBriefcase
export const Percent = LucidePercent
export const TrendingUp = LucideTrendingUp
export const ChevronRight = LucideChevronRight
export const AlertCircle = LucideAlertCircle
export const PlusCircle = LucidePlusCircle
export const InfoCircle = Info
export const Checkmark = Check
export const Shield = ShieldCheck
export const Zap = LucideZap
export const Edit = Pencil
export const Lock = LucideLock
export const CreditCard = LucideCreditCard
export const Rupee = IndianRupee
export const Calculator = LucideCalculator
export const MessageCircle = LucideMessageCircle
export const HeroIllustration = createCustomSvgIcon('/icons/tds-hero-illustration.svg', 220)

export const EMPTY_PROFILE: TdsProfile = {
  name: '',
  fullName: '',
  pan: '',
  aadhaar: '',
  dob: '',
  mobile: '',
  email: '',
  address: '',
  preliminaryRefund: '₹0',
  assessmentYear: 'AY 2026-27',
  defaultAccountHolder: '',
  defaultAccountNumber: '',
  defaultIfsc: '',
  defaultBankName: '',
}

export const DEFAULT_TDS_TAXPAYER: TdsProfile = {
  ...EMPTY_PROFILE,
  name: 'Sagu',
  fullName: 'Sagu',
  pan: 'ABCDE5478Q',
  aadhaar: '123456783690',
  dob: '2000-01-29',
  mobile: '+91 70081 38785',
  email: 'sagu@gmail.com',
  address: 'Nlr\nNellore, Assam - 523142',
  defaultAccountHolder: 'Sagu',
}
export type TdsTaxpayerProfile = TdsProfile

export const EMPTY_BANK: TdsBankDetails = {
  accountHolder: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifsc: '',
  bankName: '',
  branch: '',
  accountType: null,
}

export const EMPTY_BUSINESS: TdsBusinessDetails = {
  legalName: '',
  pan: '',
  aadhaar: '',
  mobile: '',
}

export const EMPTY_TAX: TdsIncomeTaxData = {
  taxRegime: null,
  salaryIncome: '',
  otherIncome: '',
  interestIncome: '',
  rentalIncome: 'no',
  capitalGains: 'no',
  businessIncome: 'no',
  homeLoanInterest: 'no',
  taxDeductions: 'no',
  annualRent: '',
  propertyTaxes: '',
  stcg: '',
  ltcg: '',
  turnover: '',
  netProfit: '',
  homeLoanInterestAmount: '',
  deduction80C: '',
  deduction80D: '',
  totalTdsDeducted: '',
  tcsAmount: '',
  advanceTax: '',
  selfAssessmentTax: '',
}

export const ADDITIONAL_DOCUMENTS = [
  { name: 'Form 26AS', desc: 'Tax Credit Statement from Income Tax Portal' },
  { name: 'Interest Certificate', desc: 'From banks / post office for savings & FD interest' },
  { name: 'Capital Gains Statement', desc: 'From broker (Zerodha, Groww, AngelOne, etc.)' },
  { name: 'Home Loan Certificate', desc: 'Provisional / final interest certificate from lender' },
]

export const TdsIcons = {
  CheckCircle,
  Clock,
  FileText,
  Upload,
  User,
  Building,
  Briefcase,
  Wallet,
  Percent,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  PlusCircle,
  InfoCircle,
  Checkmark,
  Shield,
  Zap,
  Edit,
  Lock,
  CreditCard,
  Rupee,
  Calculator,
  MessageCircle,
  HeroIllustration,
}

export interface UserLike {
  fullName?: string
  name?: string
  pan?: string
  aadhaar?: string
  dob?: string
  mobile?: string
  email?: string
  address?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  pincode?: string
}

export const syncProfileWithAuthUser = (
  current: TdsTaxpayerProfile,
  user?: UserLike | null
): { profile: TdsTaxpayerProfile; hasChanges: boolean } => {
  try {
    if (!user) return { profile: current, hasChanges: false }

    const addressParts = [
      user.addressLine1,
      user.addressLine2,
      user.city,
      user.state,
      user.pincode,
    ].filter(Boolean)
    const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : user.address || ''

    const cleanMobile = user.mobile
      ? (user.mobile.startsWith('+91') ? user.mobile : `+91 ${user.mobile}`)
      : ''

    const sourceMap: Partial<TdsTaxpayerProfile> = {
      fullName: user.fullName || user.name,
      name: user.name || user.fullName,
      pan: user.pan ? user.pan.toUpperCase() : undefined,
      aadhaar: user.aadhaar ? user.aadhaar.replace(/\D/g, '').slice(0, 12) : undefined,
      dob: user.dob,
      mobile: cleanMobile || undefined,
      email: user.email,
      address: formattedAddress || undefined,
    }

    // Fill only the fields the taxpayer has not entered yet
    const fills = (Object.entries(sourceMap) as [keyof TdsTaxpayerProfile, string | undefined][])
      .filter(([key, val]) => !current[key] && val)
    const next: TdsTaxpayerProfile = { ...current, ...Object.fromEntries(fills) }

    return { profile: next, hasChanges: fills.length > 0 }
  } catch (error) {
    errorTracker.captureException(error, { tags: { area: 'tds-profile-sync' } })
    return { profile: current, hasChanges: false }
  }
}

