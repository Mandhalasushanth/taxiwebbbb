import React from 'react'
import { authStorage } from '@core/auth/authStorage'
import type { AuthUser } from '@core/auth/authTypes'
import './ItrStepHeaderStepper.css'
import {
  ArrowRight as ArrowRightIcon, CreditCard as BankCardIcon, Calculator as CalculatorIcon,
  Calendar as CalendarIcon, CheckCircle2 as CheckCircleIcon, Check as CheckIcon,
  ChevronDown as ChevronDownIcon, Clock as ClockIcon, FileText as DocumentCategoryIcon,
  Download as DownloadIcon, Pencil as EditIcon, Eye as EyeIcon, FileText as FileTextIcon,
  Globe as GlobeIcon, FileClock as HistoryDocIcon, Home as HomeCategoryIcon,
  Briefcase as IconBriefcase, FileText as IconFileText, Paperclip as IconPaperclip,
  FileSpreadsheet as IconPayslip, Upload as IconUpload, Wallet as IconWallet, Info as InfoIcon,
  Laptop as LaptopCategoryIcon, Network as LinkCategoryIcon, Lock as LockIcon,
  Stethoscope as MedicalCategoryIcon, PlusCircle as PlusCircleIcon, RefreshCw as ReplaceIcon,
  Save as SaveDraftIcon, ShieldCheck as ShieldCategoryIcon, ShieldCheck as ShieldCheckIcon,
  Store as StoreCategoryIcon, TrendingUp as TrendingCategoryIcon, Upload as UploadIcon,
  User as UserCategoryIcon, User as UserIcon,
} from 'lucide-react'

export {
  ArrowRightIcon, BankCardIcon, CalculatorIcon, CalendarIcon, CheckCircleIcon, CheckIcon,
  ChevronDownIcon, ClockIcon, DocumentCategoryIcon, DownloadIcon, EditIcon, EyeIcon,
  FileTextIcon, GlobeIcon, HistoryDocIcon, HomeCategoryIcon, IconBriefcase, IconFileText,
  IconPaperclip, IconPayslip, IconUpload, IconWallet, InfoIcon, LaptopCategoryIcon,
  LinkCategoryIcon, LockIcon, MedicalCategoryIcon, PlusCircleIcon, ReplaceIcon, SaveDraftIcon,
  ShieldCategoryIcon, ShieldCheckIcon, StoreCategoryIcon, TrendingCategoryIcon, UploadIcon,
  UserCategoryIcon, UserIcon,
}

export type ItrCategoryId = 'salaried' | 'business' | 'professional' | 'freelancer' | 'trader' | 'rental' | 'capital_gains' | 'multiple'

export interface ItrCategoryItem {
  id: ItrCategoryId
  title: string
  subtitle: string
  formTag: string
  iconName: string
}

export const ITR_CATEGORIES: ItrCategoryItem[] = [
  { id: 'salaried', title: 'Salaried', subtitle: 'Salary income with Form 16', formTag: 'ITR-1', iconName: 'user' },
  { id: 'business', title: 'Business Income', subtitle: 'Trading, manufacturing & sales', formTag: 'ITR-3/4', iconName: 'store' },
  { id: 'professional', title: 'Professional', subtitle: 'Doctor, Lawyer, Consultant, CA', formTag: 'ITR-3', iconName: 'medical' },
  { id: 'freelancer', title: 'Freelancer', subtitle: 'Independent contractor & gigs', formTag: 'ITR-3/4', iconName: 'laptop' },
  { id: 'trader', title: 'Trader / Investor', subtitle: 'Stocks, F&O & Intraday', formTag: 'ITR-3', iconName: 'trending' },
  { id: 'rental', title: 'Rental Income', subtitle: 'House & commercial property', formTag: 'ITR-1/2', iconName: 'home' },
  { id: 'capital_gains', title: 'Capital Gains', subtitle: 'Property, shares & mutual funds', formTag: 'ITR-2', iconName: 'document' },
  { id: 'multiple', title: 'Multiple Sources', subtitle: 'Combination of income sources', formTag: 'ITR-2/3', iconName: 'link' },
]

export interface TaxpayerProfile {
  panNumber: string
  aadhaarNumber: string
  fullName: string
  dob: string
  mobileNumber: string
  emailAddress: string
  registeredAddress: string
}

export type AssessmentYearOption = 'AY 2026-27' | 'AY 2027-28' | 'AY 2025-26' | ''
export type ResidentialStatusOption = 'resident' | 'nri' | 'rnor' | ''
export type FilingTypeOption = 'original' | 'belated' | 'revised' | 'updated' | ''

export interface FilingBankAccount {
  id: string
  bankName: string
  accountNumber: string
  ifsc: string
  accountType?: 'savings' | 'current'
  isPrimary: boolean
  isPreValidated: boolean
}

export interface PreviousItrInfo {
  hasPreviousReturn: boolean
  previousAy?: string
  ackNumber?: string
  filingDate?: string
  hasCarryForwardLoss?: boolean
  lossAmount?: string
  importSalary?: boolean
  importDeductions?: boolean
  importLosses?: boolean
  importBankAccounts?: boolean
}

export interface SalaryDetails {
  employerName: string
  grossSalary: string
  exemptAllowances: string
  tdsDeducted: string
}

export interface HousePropertyDetails {
  propertyType: 'self_occupied' | 'let_out'
  homeLoanInterest: string
  annualRentReceived: string
  municipalTaxPaid: string
}

export interface BusinessDetails {
  reportingMethod: '44AD' | '44ADA' | 'regular' | 'not_sure'
  grossTurnover: string
  declaredNetProfit: string
}

export interface CapitalGainsDetails {
  assetTypes: string[]
  stcg: string
  ltcg: string
}

export interface OtherSourcesDetails {
  interestIncome: string
  dividendIncome: string
  otherIncome: string
}

export const ALL_SOURCES = [
  { id: 'salary', label: 'Salary / Pension' },
  { id: 'house_property', label: 'House Property' },
  { id: 'business', label: 'Business / Profession' },
  { id: 'capital_gains', label: 'Capital Gains' },
  { id: 'other_sources', label: 'Other Sources' },
]

export const ASSET_TYPE_OPTIONS = ['Equity & Mutual Funds', 'F&O & Intraday Trading', 'Crypto / VDA', 'Real Estate / Land']

export const BUSINESS_METHODS = [
  { id: '44AD' as const, title: 'Presumptive Business (Section 44AD)', desc: 'Small traders & retailers (ITR-4 Sugam)' },
  { id: '44ADA' as const, title: 'Presumptive Profession (Section 44ADA)', desc: 'Doctors, IT consultants, lawyers (ITR-4 Sugam)' },
  { id: 'regular' as const, title: 'Regular Books of Accounts (ITR-3)', desc: 'Maintaining P&L, Balance Sheet, or Audit' },
  { id: 'not_sure' as const, title: "I'm Not Sure", desc: 'TaxEdge CA will review and select the best option' },
]

export interface DeductionsData {
  epf: string
  ppf: string
  lic: string
  elss: string
  childrenTuition: string
  housingLoanPrincipal: string
  selfInsurance: string
  parentInsurance: string
  parentsSeniorCitizen: boolean
  homeLoanInterest24b: string
  section80CTotal: string
  section80D: string
  otherDeductions: string
  section80C: string
  homeLoanInterest: string
}

export interface UploadedDocInfo {
  id: string
  fileName: string
  fileSize: string
  uploadedAt: string
  file?: File
}

export interface ChecklistDocConfig {
  id: string
  title: string
  desc: string
  Icon: React.FC
  isMandatory?: boolean
}

export const REQUIRED_DOCS: ChecklistDocConfig[] = [
  { id: 'form16', title: 'Form 16 (Part A & B) *', desc: 'Issued by employer showing salary & TDS', Icon: IconBriefcase, isMandatory: true },
]

export const RECOMMENDED_DOCS: ChecklistDocConfig[] = [
  { id: 'form26as', title: 'Form 26AS Tax Credit Statement', desc: 'Helps CA reconcile TDS credits and advance tax payments', Icon: IconFileText },
  { id: 'ais_tis', title: 'AIS / TIS Statement', desc: 'Annual Information Statement for interest, dividends & trades', Icon: IconPaperclip },
  { id: 'bank_statement', title: 'Bank Account Statement', desc: 'Recent statement for savings or current account', Icon: IconWallet },
  { id: 'salary_payslips', title: 'Salary Payslips', desc: 'Recent salary slips to verify allowances and deductions', Icon: IconPayslip },
]

export const ALL_DOCS = [...REQUIRED_DOCS, ...RECOMMENDED_DOCS]

export const ITR_STEPS = [
  { id: 1, label: 'Personal & Filing' },
  { id: 2, label: 'Income Sources' },
  { id: 3, label: 'Regime & Deductions' },
  { id: 4, label: 'Document Checklist' },
  { id: 5, label: 'Review & File' },
]

export const ITR_STEP_LABELS = ['Personal & Filing Info', 'Income Sources', 'Regime & Deductions', 'Document Checklist', 'Review & File']

export const getStoredTaxpayerProfile = (overrideUser?: AuthUser | null): TaxpayerProfile => {
  try {
    const user = overrideUser || authStorage.getUser()
    if (!user) return { panNumber: '—', aadhaarNumber: '—', fullName: '', dob: '—', mobileNumber: '—', emailAddress: '—', registeredAddress: '—' }
    const rawAadhaar = user.aadhaar?.replace(/\s+/g, '') || ''
    const maskedAadhaar = rawAadhaar.length >= 4 ? `•••• •••• ${rawAadhaar.slice(-4)}` : rawAadhaar || '—'
    const formattedMobile = user.mobile ? (user.mobile.startsWith('+91') ? user.mobile : `+91 ${user.mobile}`) : '—'
    const addressParts = [user.addressLine1, user.addressLine2, user.city, user.state, user.pincode].filter(Boolean)
    return {
      panNumber: user.pan ? user.pan.toUpperCase() : '—',
      aadhaarNumber: maskedAadhaar,
      fullName: user.fullName || '',
      dob: user.dob || '—',
      mobileNumber: formattedMobile,
      emailAddress: user.email || '—',
      registeredAddress: addressParts.length > 0 ? addressParts.join(', ') : '—',
    }
  } catch {
    return { panNumber: '—', aadhaarNumber: '—', fullName: '', dob: '—', mobileNumber: '—', emailAddress: '—', registeredAddress: '—' }
  }
}

export const DEFAULT_TAXPAYER_PROFILE: TaxpayerProfile = getStoredTaxpayerProfile()
export const DEFAULT_PREVIOUS_ITR: PreviousItrInfo = { hasPreviousReturn: false, previousAy: '', ackNumber: '', filingDate: '', hasCarryForwardLoss: false, lossAmount: '' }
export const DEFAULT_SALARY_DETAILS: SalaryDetails = { employerName: '', grossSalary: '', exemptAllowances: '', tdsDeducted: '' }
export const DEFAULT_HOUSE_PROPERTY_DETAILS: HousePropertyDetails = { propertyType: 'self_occupied', homeLoanInterest: '', annualRentReceived: '', municipalTaxPaid: '' }
export const DEFAULT_BUSINESS_DETAILS: BusinessDetails = { reportingMethod: '44AD', grossTurnover: '', declaredNetProfit: '' }
export const DEFAULT_CAPITAL_GAINS_DETAILS: CapitalGainsDetails = { assetTypes: [], stcg: '', ltcg: '' }
export const DEFAULT_OTHER_SOURCES_DETAILS: OtherSourcesDetails = { interestIncome: '', dividendIncome: '', otherIncome: '' }
export const DEFAULT_DEDUCTIONS: DeductionsData = {
  epf: '', ppf: '', lic: '', elss: '', childrenTuition: '', housingLoanPrincipal: '', selfInsurance: '', parentInsurance: '',
  parentsSeniorCitizen: false, homeLoanInterest24b: '', otherDeductions: '', section80CTotal: '', section80C: '', section80D: '', homeLoanInterest: '',
}

export const PROGRESS_STAGES = [
  { id: 1, label: 'Application\nReceived', done: true, icon: <FileTextIcon size={20} /> },
  { id: 2, label: 'Documents\nUnder Review', active: true, icon: <EyeIcon size={20} /> },
  { id: 3, label: 'CA Preparing\nReturn', done: false, icon: <EditIcon size={20} /> },
  { id: 4, label: 'Ready for\nConfirmation', done: false, icon: <ShieldCheckIcon size={20} /> },
  { id: 5, label: 'Return\nFiled', done: false, icon: <CheckCircleIcon size={20} /> },
  { id: 6, label: 'Processed &\nRefund', done: false, icon: <ReplaceIcon size={20} /> },
]

export interface ItrFilingHeaderStepperProps { currentStepId: number }

const resolveDotTone = (stepId: number, currentStepId: number): 'completed' | 'active' | 'inactive' => {
  if (stepId < currentStepId) return 'completed'
  if (stepId === currentStepId) return 'active'
  return 'inactive'
}

export const ItrFilingHeaderStepper: React.FC<ItrFilingHeaderStepperProps> = ({ currentStepId }) => (
  <div className="itr-personal-header">
    <div className="itr-personal-title-group"><h1 className="itr-personal-title">ITR Filing</h1></div>
    <div className="itr-stepper-track" aria-label="Step progress">
      {ITR_STEPS.map((stepItem, idx) => {
        const tone = resolveDotTone(stepItem.id, currentStepId)
        return (
          <React.Fragment key={stepItem.id}>
            <div className="itr-stepper-step-item">
              <div className={`itr-stepper-dot itr-stepper-dot--${tone}`} title={`Step ${stepItem.id}: ${stepItem.label}`}>
                {tone === 'completed' ? <CheckIcon size={16} /> : stepItem.id}
              </div>
              <span className={`itr-stepper-label ${tone === 'active' ? 'itr-stepper-label--active' : ''}`}>{stepItem.label}</span>
            </div>
            {idx < ITR_STEPS.length - 1 && (
              <div className={`itr-stepper-line ${tone === 'completed' ? 'itr-stepper-line--completed' : ''}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  </div>
)
