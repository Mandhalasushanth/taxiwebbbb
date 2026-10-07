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
  Calendar,
  Award,
  Wallet,
} from 'lucide-react'
import type { TdsProfile, TdsBankDetails, TdsIncomeTaxData } from '../types/tdsRefund.types'

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

export interface WhyChooseItem {
  id: string
  title: string
  description: string
  icon: 'wallet' | 'expert' | 'clock' | 'trending'
}

export interface HowItWorksStep {
  stepNumber: number
  title: string
  icon: 'edit' | 'upload' | 'verification' | 'filing' | 'credit'
}

export interface DocumentItem {
  id: string
  title: string
  name?: string
  icon: 'pan' | 'aadhaar' | 'form16' | 'ais' | 'tis' | 'bank' | 'salary' | 'more'
  isMoreBtn?: boolean
}

export const WHY_CHOOSE_ITEMS: WhyChooseItem[] = [
  {
    id: 'maximum-refund',
    title: 'Maximum Refund',
    description: 'Identifies all eligible tax credits to maximize refund.',
    icon: 'wallet',
  },
  {
    id: 'expert-review',
    title: 'Expert CA Review',
    description: 'Verified by certified tax professionals.',
    icon: 'expert',
  },
  {
    id: 'fast-filing',
    title: 'Fast Filing',
    description: 'Prompt verification and swift return submission.',
    icon: 'clock',
  },
  {
    id: 'live-tracking',
    title: 'Live Tracking',
    description: 'Real-time updates from filing to refund credit.',
    icon: 'trending',
  },
]

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  { stepNumber: 1, title: 'Submit Details', icon: 'edit' },
  { stepNumber: 2, title: 'Upload Documents', icon: 'upload' },
  { stepNumber: 3, title: 'Executive Verification', icon: 'verification' },
  { stepNumber: 4, title: 'Payment', icon: 'filing' },
  { stepNumber: 5, title: 'Refund Credited', icon: 'credit' },
]

export const DOCUMENTS_REQUIRED: DocumentItem[] = [
  { id: 'pan', title: 'PAN Card', icon: 'pan' },
  { id: 'aadhaar', title: 'Aadhaar Card', icon: 'aadhaar' },
  { id: 'form16', title: 'Form 16 / Form 16A', icon: 'form16' },
  { id: 'ais', title: 'AIS Statement', icon: 'ais' },
  { id: 'tis', title: 'TIS Statement', icon: 'tis' },
  { id: 'bank', title: 'Bank Statement', icon: 'bank' },
  { id: 'salary', title: 'Salary Slip (if applicable)', icon: 'salary' },
  { id: 'more', title: 'More', icon: 'more', isMoreBtn: true },
]

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

export interface TdsDocumentConfig {
  id: string
  title: string
  subtitle: string
  required: boolean
  accept: string
  maxSizeMb: number
  bgColor: string
  iconColor: string
}

export const TDS_DOCUMENTS: TdsDocumentConfig[] = [
  { id: 'pan', title: 'PAN', subtitle: 'Permanent Account Number Card · up to 5MB', required: true, accept: '.pdf,.jpg,.jpeg,.png', maxSizeMb: 5, bgColor: '#e0f2fe', iconColor: '#0284c7' },
  { id: 'form16', title: 'Form 16 (Part A & B)', subtitle: 'TDS Certificate issued by employer · up to 10MB', required: true, accept: '.pdf', maxSizeMb: 10, bgColor: '#ffe4e6', iconColor: '#e11d48' },
  { id: 'form16a', title: 'Form 16A', subtitle: 'Non-salary TDS Certificate from banks/others · up to 10MB', required: false, accept: '.pdf', maxSizeMb: 10, bgColor: '#f3e8ff', iconColor: '#9333ea' },
  { id: 'ais', title: 'AIS', subtitle: 'Annual Information Statement from IT Portal · up to 10MB', required: true, accept: '.pdf,.json', maxSizeMb: 10, bgColor: '#e0f2fe', iconColor: '#0284c7' },
  { id: 'tis', title: 'TIS', subtitle: 'Taxpayer Information Summary · up to 25MB', required: false, accept: '.pdf', maxSizeMb: 25, bgColor: '#dcfce7', iconColor: '#16a34a' },
  { id: 'bankStatements', title: 'Bank Statements', subtitle: 'Last 6–12 months bank statements · up to 25MB', required: true, accept: '.pdf', maxSizeMb: 25, bgColor: '#fef3c7', iconColor: '#d97706' },
  { id: 'previousItr', title: 'Previous ITR', subtitle: 'Previous assessment year filed acknowledgement · up to 10MB', required: false, accept: '.pdf', maxSizeMb: 10, bgColor: '#e0e7ff', iconColor: '#6366f1' },
  { id: 'tdsCertificates', title: 'TDS Certificates', subtitle: 'Form 16B/16C or other deduction proofs · up to 10MB', required: true, accept: '.pdf', maxSizeMb: 10, bgColor: '#dcfce7', iconColor: '#16a34a' },
  { id: 'supportingDocs', title: 'Supporting Income Documents', subtitle: 'Interest certificates, capital gain sheets · up to 15MB', required: false, accept: '.pdf,.xlsx,.csv', maxSizeMb: 15, bgColor: '#ffedd5', iconColor: '#ea580c' },
]

export const DocIcons: Record<string, React.FC<{ color?: string }>> = {
  pan: ({ color }) => React.createElement(LucideCreditCard, { size: 22, color }),
  form16: ({ color }) => React.createElement(LucideFileText, { size: 22, color }),
  form16a: ({ color }) => React.createElement(LucideFileText, { size: 22, color }),
  ais: ({ color }) => React.createElement(LucideFileText, { size: 22, color }),
  tis: ({ color }) => React.createElement(LucideFileText, { size: 22, color }),
  bankStatements: ({ color }) => React.createElement(Landmark, { size: 22, color }),
  previousItr: ({ color }) => React.createElement(Calendar, { size: 22, color }),
  tdsCertificates: ({ color }) => React.createElement(Award, { size: 22, color }),
  supportingDocs: ({ color }) => React.createElement(Wallet, { size: 22, color }),
}

export interface IfscDetails {
  bankName: string
  branch: string
}

export const fetchIfscDetails = async (ifsc: string): Promise<IfscDetails | null> => {
  try {
    const code = ifsc.toUpperCase().trim()
    if (code.length !== 11) return null
    const res = await fetch(`https://ifsc.razorpay.com/${code}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.BANK && data.BRANCH) {
      return {
        bankName: String(data.BANK),
        branch: String(data.BRANCH),
      }
    }
    return null
  } catch {
    return null
  }
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

    let hasChanges = false
    const next = { ...current }

    for (const [key, val] of Object.entries(sourceMap) as [keyof TdsTaxpayerProfile, string | undefined][]) {
      if (!next[key] && val) {
        next[key] = val as any
        hasChanges = true
      }
    }

    return { profile: next, hasChanges }
  } catch (error) {
    console.error('Failed to sync profile with user data:', error)
    return { profile: current, hasChanges: false }
  }
}

