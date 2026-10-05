import React, { useState } from 'react'
import { User, Landmark, Calculator, ShieldCheck } from 'lucide-react'
import { StepActionBar, ConfirmAccountNumberInput } from '@shared/components'
import { formatMobile, validatePan, validateMobileNumber, validateAadhaar, validateIfsc, validateBankAccNumber, validateName, validateEmail } from '@shared/utils/validationUtils'
import { DEFAULT_TDS_TAXPAYER, EMPTY_BANK, EMPTY_TAX, TdsIcons, fetchIfscDetails, type TdsTaxpayerProfile } from '../../../utils/tdsRefund.constants'
import type { TdsBankDetails, TdsIncomeTaxData } from '../../../types/tdsRefund.types'
import { TdsRefundProgressTracker } from '../TdsRefundOverview'
import './TdsRefundCustomerIncome.css'

export type { TdsBankDetails, TdsIncomeTaxData }

export interface TdsRefundPrelimBannerProps { assessmentYear?: string; refundAmount: string }

export const TdsRefundPrelimBanner: React.FC<TdsRefundPrelimBannerProps> = ({ assessmentYear = 'AY 2026-27', refundAmount }) => (
  <section className="tds-prelim-card">
    <div className="tds-prelim-left">
      <div className="tds-prelim-tag-row"><span className="tds-prelim-tag">PRELIMINARY ESTIMATED REFUND</span><span className="tds-prelim-ay">{assessmentYear}</span></div>
      <div className="tds-prelim-amount" data-testid="prelim-refund-amount">{refundAmount}</div>
      <p className="tds-prelim-desc">Estimated from verified Form 26AS, AIS, and advance TDS deduction records.</p>
    </div>
    <div className="tds-prelim-badge-box">
      <div className="tds-prelim-badge-item"><TdsIcons.Checkmark /><span>ITD Pre-reconciled</span></div>
      <div className="tds-prelim-badge-item"><TdsIcons.Shield /><span>100% Audit Protected</span></div>
    </div>
  </section>
)

const PROGRESSION_CHECKLIST = ['Pre-filled from ITD Portal', 'Bank verified for direct credit', 'Next: Upload Form 16 / AIS / Bank Stmt']

export const TdsRefundProgressionSidebar: React.FC = () => (
  <aside className="tds-step1-sidebar" aria-label="Claim progression and verification">
    <div className="tds-progression-card">
      <span className="tds-progression-badge">Stage 1 Completed</span>
      <h3 className="tds-progression-title">Claim Progression</h3>
      <p className="tds-progression-desc">Review profile details, income information and bank account before proceeding.</p>
      <div className="tds-progression-checklist">
        {PROGRESSION_CHECKLIST.map((item) => (
          <div key={item} className="tds-progression-item"><TdsIcons.Checkmark /><span>{item}</span></div>
        ))}
      </div>
      <div className="tds-progression-security">
        <div className="tds-prog-sec-row"><TdsIcons.Shield /><span>256-bit Bank Grade Security</span></div>
        <div className="tds-prog-sec-row"><TdsIcons.Zap /><span>Instant CA validation upon filing</span></div>
      </div>
    </div>
    <div className="tds-sidebar-card tds-sidebar-trust-card">
      <div className="tds-trust-icon-box"><TdsIcons.Shield /></div>
      <div>
        <h4 className="tds-trust-title">Expert CA Verification</h4>
        <p className="tds-trust-desc">Your refund claim and bank details are cross-verified by a Senior Chartered Accountant before submission to ITD.</p>
      </div>
    </div>
  </aside>
)

interface CategoryToggleConfig {
  key: 'rentalIncome' | 'capitalGains' | 'businessIncome' | 'homeLoanInterest' | 'taxDeductions'
  title: string
  subtitle: string
  twoColumn?: boolean
  fields: Array<{ id: string; label: string; key: keyof TdsIncomeTaxData; placeholder: string }>
}

const CATEGORY_TOGGLE_CONFIGS: CategoryToggleConfig[] = [
  { key: 'rentalIncome', title: 'Rental Income', subtitle: 'House property rent', fields: [{ id: 'tds-annual-rent', label: 'Annual Rent Received (₹)', key: 'annualRent', placeholder: 'Enter rental income' }, { id: 'tds-property-taxes', label: 'Property Taxes Paid (₹)', key: 'propertyTaxes', placeholder: 'Enter municipal taxes' }] },
  { key: 'capitalGains', title: 'Capital Gains', subtitle: 'Stocks / MF / Property', twoColumn: true, fields: [{ id: 'tds-stcg', label: 'Short-Term Gains (₹)', key: 'stcg', placeholder: 'Enter STCG' }, { id: 'tds-ltcg', label: 'Long-Term Gains (₹)', key: 'ltcg', placeholder: 'Enter LTCG' }] },
  { key: 'businessIncome', title: 'Business / Profession', subtitle: 'Freelance or business income', twoColumn: true, fields: [{ id: 'tds-turnover', label: 'Turnover (₹)', key: 'turnover', placeholder: 'Enter turnover' }, { id: 'tds-net-profit', label: 'Net Profit (₹)', key: 'netProfit', placeholder: 'Enter profit' }] },
  { key: 'homeLoanInterest', title: 'Home Loan Interest', subtitle: 'Self-occupied house property', fields: [{ id: 'tds-interest-paid', label: 'Interest Paid (Sec 24b) (₹)', key: 'homeLoanInterestAmount', placeholder: 'Enter interest paid' }] },
  { key: 'taxDeductions', title: 'Tax Deductions', subtitle: 'Section 80C, 80D, 80G', twoColumn: true, fields: [{ id: 'tds-deduction-80c', label: '80C (PPF, ELSS, LIC) (₹)', key: 'deduction80C', placeholder: 'Up to ₹1.5L' }, { id: 'tds-deduction-80d', label: '80D (Health Ins.) (₹)', key: 'deduction80D', placeholder: 'Up to ₹75k' }] },
]

const CORE_INCOME_FIELDS: Array<{ id: string; label: string; key: keyof TdsIncomeTaxData; placeholder: string; required?: boolean }> = [
  { id: 'tds-salary-income', label: 'Annual Salary Income (₹)', key: 'salaryIncome', placeholder: 'Enter your salary income', required: true },
  { id: 'tds-other-income', label: 'Other Income / Moonlighting (₹)', key: 'otherIncome', placeholder: 'Enter other income' },
  { id: 'tds-interest-income', label: 'Interest Income (Savings/FD) (₹)', key: 'interestIncome', placeholder: 'Enter interest income' },
]

const TAXES_PAID_FIELDS: Array<{ id: string; label: string; key: keyof TdsIncomeTaxData; placeholder: string; required?: boolean }> = [
  { id: 'tds-total-tds', label: 'Total TDS Deducted (₹)', key: 'totalTdsDeducted', placeholder: 'Enter total TDS deducted', required: true },
  { id: 'tds-tcs-amount', label: 'TCS Collected (₹)', key: 'tcsAmount', placeholder: 'Enter TCS amount' },
  { id: 'tds-advance-tax', label: 'Advance Tax Paid (₹)', key: 'advanceTax', placeholder: 'Enter advance tax paid' },
  { id: 'tds-self-tax', label: 'Self-Assessment Tax Paid (₹)', key: 'selfAssessmentTax', placeholder: 'Enter self-assessment tax paid' },
]

export interface TdsRefundCustomerIncomeProps {
  onBack: () => void
  onNext: () => void
  onSaveDraft?: () => void
  currentStep?: number
  initialProfile?: TdsTaxpayerProfile
  onProfileChange?: (profile: TdsTaxpayerProfile) => void
  initialBankDetails?: TdsBankDetails
  onBankChange?: (details: TdsBankDetails) => void
  initialTaxData?: TdsIncomeTaxData
  onTaxChange?: (data: TdsIncomeTaxData) => void
}

export type TdsRefundStepCustomerIncomeProps = TdsRefundCustomerIncomeProps

const parseAmount = (val?: string) => {
  try {
    return Number((val || '').replace(/[^0-9.]/g, '') || 0)
  } catch {
    return 0
  }
}

const getCategoryClearUpdates = (key: CategoryToggleConfig['key']): Partial<TdsIncomeTaxData> => {
  if (key === 'rentalIncome') return { rentalIncome: 'no', annualRent: '', propertyTaxes: '' }
  if (key === 'capitalGains') return { capitalGains: 'no', stcg: '', ltcg: '' }
  if (key === 'businessIncome') return { businessIncome: 'no', turnover: '', netProfit: '' }
  if (key === 'homeLoanInterest') return { homeLoanInterest: 'no', homeLoanInterestAmount: '' }
  if (key === 'taxDeductions') return { taxDeductions: 'no', deduction80C: '', deduction80D: '' }
  return { [key]: 'no' }
}

export const TdsRefundCustomerIncome: React.FC<TdsRefundCustomerIncomeProps> = ({
  onBack, onNext, onSaveDraft, currentStep = 1, initialProfile, onProfileChange,
  initialBankDetails, onBankChange, initialTaxData, onTaxChange,
}) => {
  const [profile, setProfile] = useState<TdsTaxpayerProfile>(initialProfile || DEFAULT_TDS_TAXPAYER)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isFetchingIfsc, setIsFetchingIfsc] = useState(false)
  const [bankDetails, setBankDetails] = useState<TdsBankDetails>(initialBankDetails || { ...EMPTY_BANK })
  const [taxData, setTaxData] = useState<TdsIncomeTaxData>(initialTaxData || { ...EMPTY_TAX })

  const handleProfileChange = (updated: Partial<TdsTaxpayerProfile>) => {
    if (error) setError(null)
    const next = { ...profile, ...updated }
    setProfile(next)
    onProfileChange?.(next)
    const changedKey = Object.keys(updated)[0]
    if (changedKey && fieldErrors[changedKey]) {
      setFieldErrors((prev) => ({ ...prev, [changedKey]: '' }))
    }
  }

  const handleBankChange = (updated: Partial<TdsBankDetails>) => {
    if (error) setError(null)
    const next = { ...bankDetails, ...updated }
    setBankDetails(next)
    onBankChange?.(next)
    const changedKey = Object.keys(updated)[0]
    if (changedKey && fieldErrors[changedKey]) {
      setFieldErrors((prev) => ({ ...prev, [changedKey]: '' }))
    }
  }

  const handleTaxChange = (updated: Partial<TdsIncomeTaxData>) => {
    const next = { ...taxData, ...updated }
    setTaxData(next)
    onTaxChange?.(next)
    const changedKey = Object.keys(updated)[0]
    if (changedKey && fieldErrors[changedKey]) {
      setFieldErrors((prev) => ({ ...prev, [changedKey]: '' }))
    }
  }

  const handleIfscChange = async (rawVal: string) => {
    try {
      const formatted = rawVal.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)
      handleBankChange({ ifsc: formatted })
      if (formatted.length === 11) {
        setIsFetchingIfsc(true)
        try {
          const match = await fetchIfscDetails(formatted)
          if (match) handleBankChange({ ifsc: formatted, bankName: match.bankName, branch: match.branch })
        } finally {
          setIsFetchingIfsc(false)
        }
      } else if (formatted === '') {
        handleBankChange({ ifsc: '', bankName: '', branch: '' })
      }
    } catch {
      setIsFetchingIfsc(false)
    }
  }

  const handleContinue = (e?: React.FormEvent) => {
    try {
      if (e) e.preventDefault()
      setError(null)
      const errs: Record<string, string> = {}

      if (!profile.fullName?.trim()) {
        errs.fullName = 'Name is required'
      } else {
        const err = validateName(profile.fullName)
        if (err) errs.fullName = err
      }

      if (!profile.pan?.trim()) {
        errs.pan = 'PAN is required'
      } else {
        const err = validatePan(profile.pan)
        if (err) errs.pan = err
      }

      if (profile.mobile?.trim()) {
        const err = validateMobileNumber(profile.mobile)
        if (err) errs.mobile = err
      }

      if (profile.aadhaar?.trim()) {
        const err = validateAadhaar(profile.aadhaar)
        if (err) errs.aadhaar = err
      }

      if (profile.email?.trim()) {
        const err = validateEmail(profile.email)
        if (err) errs.email = err
      }

      if (!bankDetails.accountHolder?.trim()) {
        errs.accountHolder = 'Account holder name is required'
      }

      const acct = bankDetails.accountNumber?.trim() || ''
      const confirmAcct = bankDetails.confirmAccountNumber?.trim() || ''
      const ifsc = bankDetails.ifsc?.trim() || ''

      if (!acct) {
        errs.accountNumber = 'Bank account number is required'
      } else {
        const err = validateBankAccNumber(acct)
        if (err) errs.accountNumber = err
      }

      if (!confirmAcct) {
        errs.confirmAccountNumber = 'Bank account number is required'
      } else if (acct !== confirmAcct) {
        errs.confirmAccountNumber = 'Account numbers do not match'
      }

      if (!ifsc) {
        errs.ifsc = 'IFSC code is required'
      } else {
        const err = validateIfsc(ifsc)
        if (err) errs.ifsc = err
      }

      if (parseAmount(taxData.totalTdsDeducted) <= 0) {
        errs.totalTdsDeducted = 'Total TDS Deducted is required'
      }

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs)
        setError(Object.values(errs)[0])
        return
      }

      setFieldErrors({})
      onNext()
    } catch {
      onNext()
    }
  }

  const totalTaxCredits = parseAmount(taxData.totalTdsDeducted) + parseAmount(taxData.tcsAmount) + parseAmount(taxData.advanceTax) + parseAmount(taxData.selfAssessmentTax)
  const computedRefundTotal = totalTaxCredits > 0 ? `₹${totalTaxCredits.toLocaleString('en-IN')}` : profile.preliminaryRefund || '₹0'
  const isProfileValid = Boolean(profile.fullName?.trim() && profile.pan?.trim() && profile.pan.trim().length === 10)
  const isBankValidated = Boolean(bankDetails.accountNumber && bankDetails.ifsc && bankDetails.bankName)
  const isFormValid = Boolean(
    isProfileValid && bankDetails.accountHolder?.trim() && bankDetails.accountNumber?.trim() &&
    bankDetails.accountNumber.trim().length >= 10 && bankDetails.accountNumber.trim().length <= 15 &&
    bankDetails.confirmAccountNumber?.trim() && bankDetails.accountNumber.trim() === bankDetails.confirmAccountNumber.trim() &&
    bankDetails.ifsc?.trim().length === 11 && parseAmount(taxData.totalTdsDeducted) > 0
  )

  const handleContinueRef = React.useRef(handleContinue)
  React.useEffect(() => {
    handleContinueRef.current = handleContinue
  })

  React.useEffect(() => {
    const handleAttempt = () => {
      handleContinueRef.current()
    }
    window.addEventListener('step-action-bar:submit-attempt', handleAttempt)
    return () => window.removeEventListener('step-action-bar:submit-attempt', handleAttempt)
  }, [])

  const renderTaxFieldInput = (field: { id: string; label: string; key: keyof TdsIncomeTaxData; placeholder: string; required?: boolean }) => (
    <div key={field.id} className="tds-form-group">
      <label htmlFor={field.id} className="tds-label">{field.label} {field.required && <span className="tds-required">*</span>}</label>
      <input id={field.id} type="text" className="tds-input" placeholder={field.placeholder} value={(taxData[field.key] as string) || ''} onChange={(e) => handleTaxChange({ [field.key]: e.target.value } as Partial<TdsIncomeTaxData>)} />
    </div>
  )

  return (
    <div className="tds-step1-page">
      <TdsRefundProgressTracker currentStep={currentStep} />
      <TdsRefundPrelimBanner assessmentYear={profile.assessmentYear || 'AY 2026-27'} refundAmount={computedRefundTotal} />
      <div className="tds-step1-layout">
        <form className="tds-step1-main" onSubmit={handleContinue}>
          <div className="tds-card" data-testid="tds-card-personal">
            <div className="tds-card-header">
              <div className="tds-card-title-wrap">
                <div className="tds-card-icon-box tds-card-icon-box--user" aria-hidden="true">
                  <User size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="tds-card-title">Personal Information</h2>
                  <span className="tds-card-subtitle">Taxpayer identity and contact details</span>
                </div>
              </div>
              {isProfileValid && <span className="tds-pill-verified"><TdsIcons.Checkmark /> Ready</span>}
            </div>
            <div className="tds-personal-grid">
              <div className="tds-form-group">
                <label htmlFor="tds-profile-fullname" className="tds-label">Full Name <span className="tds-required">*</span></label>
                <input id="tds-profile-fullname" type="text" className={`tds-input ${fieldErrors.fullName ? 'has-error' : ''}`} value={profile.fullName} onChange={(e) => handleProfileChange({ fullName: e.target.value, name: e.target.value })} placeholder="Enter your name" required />
                {fieldErrors.fullName && <span className="tds-field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.fullName}</span>}
              </div>
              <div className="tds-form-group">
                <label htmlFor="tds-profile-pan" className="tds-label">PAN Number <span className="tds-required">*</span></label>
                <input id="tds-profile-pan" type="text" className={`tds-input tds-input--upper ${fieldErrors.pan ? 'has-error' : ''}`} value={profile.pan} onChange={(e) => handleProfileChange({ pan: e.target.value.toUpperCase() })} placeholder="Enter your PAN" maxLength={10} required />
                {fieldErrors.pan && <span className="tds-field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.pan}</span>}
              </div>
              <div className="tds-form-group">
                <label htmlFor="tds-profile-aadhaar" className="tds-label">Aadhaar Number</label>
                <input id="tds-profile-aadhaar" type="text" className={`tds-input ${fieldErrors.aadhaar ? 'has-error' : ''}`} value={profile.aadhaar} onChange={(e) => handleProfileChange({ aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })} placeholder="Enter your Aadhaar number" maxLength={12} />
                {fieldErrors.aadhaar && <span className="tds-field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.aadhaar}</span>}
              </div>
              <div className="tds-form-group"><label htmlFor="tds-profile-dob" className="tds-label">Date of Birth</label><input id="tds-profile-dob" type="date" className="tds-input" value={profile.dob} onChange={(e) => handleProfileChange({ dob: e.target.value })} /></div>
              <div className="tds-form-group">
                <label htmlFor="tds-profile-mobile" className="tds-label">Mobile Number</label>
                <input id="tds-profile-mobile" type="tel" className={`tds-input ${fieldErrors.mobile ? 'has-error' : ''}`} value={profile.mobile} onChange={(e) => handleProfileChange({ mobile: formatMobile(e.target.value) })} placeholder="Enter your mobile number" />
                {fieldErrors.mobile && <span className="tds-field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.mobile}</span>}
              </div>
              <div className="tds-form-group">
                <label htmlFor="tds-profile-email" className="tds-label">Email Address</label>
                <input id="tds-profile-email" type="email" className={`tds-input ${fieldErrors.email ? 'has-error' : ''}`} value={profile.email} onChange={(e) => handleProfileChange({ email: e.target.value })} placeholder="Enter your email address" />
                {fieldErrors.email && <span className="tds-field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.email}</span>}
              </div>
              <div className="tds-form-group tds-form-group--full"><label htmlFor="tds-profile-address" className="tds-label">Address</label><input id="tds-profile-address" type="text" className="tds-input" value={profile.address} onChange={(e) => handleProfileChange({ address: e.target.value })} placeholder="Enter your address" /></div>
            </div>
          </div>

          <div className="tds-card" data-testid="tds-card-bank">
            <div className="tds-card-header">
              <div className="tds-card-title-wrap">
                <div className="tds-card-icon-box tds-card-icon-box--bank" aria-hidden="true">
                  <Landmark size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="tds-card-title">Refund Bank Account</h2>
                  <span className="tds-card-subtitle">Excess TDS will be credited directly to this account</span>
                </div>
              </div>
              {isBankValidated && <span className="tds-pill-verified"><TdsIcons.Checkmark /> Validated</span>}
            </div>
            {error && <div className="tds-form-error" role="alert">{error}</div>}
            <div className="tds-bank-form">
              <div className="tds-form-group">
                <label htmlFor="tds-account-holder" className="tds-label">Account Holder Name <span className="tds-required">*</span></label>
                <input id="tds-account-holder" type="text" className={`tds-input ${fieldErrors.accountHolder ? 'has-error' : ''}`} value={bankDetails.accountHolder} onChange={(e) => handleBankChange({ accountHolder: e.target.value })} placeholder="Enter account holder name" required />
                {fieldErrors.accountHolder && <span className="tds-field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.accountHolder}</span>}
              </div>
              <div className="tds-form-grid-2">
                <div className="tds-form-group">
                  <label htmlFor="tds-account-number" className="tds-label">Bank Account Number <span className="tds-required">*</span></label>
                  <input id="tds-account-number" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={18} className={`tds-input ${fieldErrors.accountNumber ? 'has-error' : ''}`} value={bankDetails.accountNumber} onChange={(e) => handleBankChange({ accountNumber: e.target.value.replace(/\D/g, '').slice(0, 18) })} placeholder="Enter your bank account number" required />
                  {fieldErrors.accountNumber && <span className="tds-field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.accountNumber}</span>}
                </div>
                <div className="tds-form-group">
                  <label htmlFor="tds-confirm-account" className="tds-label">
                    Confirm Account Number <span className="tds-required">*</span>
                  </label>
                  <ConfirmAccountNumberInput
                    id="tds-confirm-account"
                    name="confirmAccountNumber"
                    maxLength={18}
                    className="tds-input"
                    value={bankDetails.confirmAccountNumber}
                    onChange={(val) => handleBankChange({ confirmAccountNumber: val })}
                    placeholder="Enter your bank account number"
                    hasError={Boolean(fieldErrors.confirmAccountNumber)}
                    error={fieldErrors.confirmAccountNumber}
                    required
                  />
                </div>
              </div>
              <div className="tds-form-group">
                <label htmlFor="tds-ifsc" className="tds-label">IFSC Code <span className="tds-required">*</span></label>
                <input id="tds-ifsc" type="text" className={`tds-input tds-input--upper ${fieldErrors.ifsc ? 'has-error' : ''}`} value={bankDetails.ifsc} onChange={(e) => handleIfscChange(e.target.value)} placeholder="Enter your IFSC code" maxLength={11} required />
                {fieldErrors.ifsc && <span className="tds-field-error" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.ifsc}</span>}
                {isFetchingIfsc && <span className="tds-field-hint tds-field-hint--warning">Fetching bank details...</span>}
              </div>
              {bankDetails.bankName && bankDetails.branch && (
                <div className="tds-bank-status-pill" data-testid="tds-bank-verified-pill"><span className="tds-bank-status-icon"><TdsIcons.Checkmark /></span><span className="tds-bank-status-text">{bankDetails.bankName} • {bankDetails.branch}</span></div>
              )}
              <div className="tds-form-grid-2">
                <div className="tds-form-group"><label htmlFor="tds-bank-name" className="tds-label">Bank Name</label><input id="tds-bank-name" type="text" className="tds-input" value={bankDetails.bankName} onChange={(e) => handleBankChange({ bankName: e.target.value })} placeholder="Enter your bank name" /></div>
                <div className="tds-form-group"><label htmlFor="tds-bank-branch" className="tds-label">Branch</label><input id="tds-bank-branch" type="text" className="tds-input" value={bankDetails.branch} onChange={(e) => handleBankChange({ branch: e.target.value })} placeholder="Enter branch name" /></div>
              </div>
              <div className="tds-form-group"><span className="tds-label">Account Type</span><div className="tds-type-pills">{((['savings', 'current'] as const)).map((type) => (<button key={type} type="button" className={`tds-type-pill ${bankDetails.accountType === type ? 'tds-type-pill--active' : ''}`} onClick={() => handleBankChange({ accountType: type })}>{type === 'savings' ? 'Savings Account' : 'Current Account'}</button>))}</div></div>
            </div>
          </div>

          <div className="tds-card" data-testid="tds-card-income">
            <div className="tds-card-header">
              <div className="tds-card-title-wrap">
                <div className="tds-card-icon-box tds-card-icon-box--calc" aria-hidden="true">
                  <Calculator size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="tds-card-title">Income &amp; Tax Information</h2>
                  <span className="tds-card-subtitle">Tax calculation breakdown and additional earnings</span>
                </div>
              </div>
            </div>
            <div className="tds-income-form">
              <div className="tds-form-group">
                <label className="tds-label">Income Tax Regime <span className="tds-required">*</span></label>
                <div className="tds-taxRegime-grid">
                  <button type="button" className={`tds-taxRegime-card ${taxData.taxRegime === 'new' ? 'tds-taxRegime-card--active' : ''}`} onClick={() => handleTaxChange({ taxRegime: 'new' })} data-testid="taxRegime-new"><div className="tds-taxRegime-title">New Tax Regime</div><div className="tds-taxRegime-sub">Default (Lower tax slabs, standard deduction)</div></button>
                  <button type="button" className={`tds-taxRegime-card ${taxData.taxRegime === 'old' ? 'tds-taxRegime-card--active' : ''}`} onClick={() => handleTaxChange({ taxRegime: 'old' })} data-testid="taxRegime-old"><div className="tds-taxRegime-title">Old Tax Regime</div><div className="tds-taxRegime-sub">With 80C, 80D, HRA &amp; Home Loan deductions</div></button>
                </div>
              </div>
              <div className="tds-form-grid-2">{CORE_INCOME_FIELDS.map(renderTaxFieldInput)}</div>
              <div className="tds-form-group">
                <label className="tds-label">Additional Income Streams &amp; Deductions</label>
                <div className="tds-toggles-list">
                  {CATEGORY_TOGGLE_CONFIGS.map((cfg) => {
                    const activeVal = taxData[cfg.key]
                    return (
                      <div key={cfg.key} className="tds-toggle-card" data-testid={`toggle-row-${cfg.key}`}>
                        <div className="tds-toggle-header">
                          <div className="tds-toggle-info"><span className="tds-toggle-title">{cfg.title}</span><span className="tds-toggle-subtitle">{cfg.subtitle}</span></div>
                          <div className="tds-yes-no-group">
                            {((['yes', 'no'] as const)).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                className={`tds-yes-no-btn ${activeVal === opt ? 'tds-yes-no-btn--active' : ''}`}
                                onClick={() => {
                                  if (opt === 'no') {
                                    handleTaxChange(getCategoryClearUpdates(cfg.key))
                                  } else {
                                    handleTaxChange({ [cfg.key]: 'yes' } as Partial<TdsIncomeTaxData>)
                                  }
                                }}
                              >
                                {opt === 'yes' ? 'Yes' : 'No'}
                              </button>
                            ))}
                          </div>
                        </div>
                        {activeVal === 'yes' && (
                          <div className={`tds-toggle-subfields ${cfg.twoColumn ? 'tds-form-grid-2' : ''}`}>
                            {cfg.fields.map(renderTaxFieldInput)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="tds-card" data-testid="tds-card-taxes-paid">
            <div className="tds-card-header">
              <div className="tds-card-title-wrap">
                <div className="tds-card-icon-box tds-card-icon-box--shield" aria-hidden="true">
                  <ShieldCheck size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="tds-card-title">Taxes Already Paid (As per 26AS / AIS)</h2>
                  <span className="tds-card-subtitle">Tax credits deducted at source or paid in advance</span>
                </div>
              </div>
            </div>
            <div className="tds-income-form"><div className="tds-form-grid-2">{TAXES_PAID_FIELDS.map(renderTaxFieldInput)}</div></div>
          </div>
        </form>
      </div>
      {error && (
        <div className="tds-form-error" role="alert" style={{ margin: '0.75rem 0' }}>
          {error}
        </div>
      )}
      <StepActionBar onBack={onBack} onNext={handleContinue} onSaveDraft={onSaveDraft} nextLabel="Continue" nextDisabled={!isFormValid} />
    </div>
  )
}

export const TdsRefundStepCustomerIncome = TdsRefundCustomerIncome
export default TdsRefundCustomerIncome
