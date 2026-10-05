import { type ChangeEvent } from 'react'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
import { lookupSampleBankByIfsc, fetchBankDetailsByIfsc } from '@shared/services'
import { ConfirmAccountNumberInput } from '@shared/components'

export interface GSTBankDetailsProps {
  data: Pick<
    GstBusinessFormData,
    | 'accountHolderName'
    | 'accountNumber'
    | 'confirmAccountNumber'
    | 'ifscCode'
    | 'bankName'
    | 'branch'
    | 'accountType'
  >
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

const ACCOUNT_TYPE_OPTIONS = [
  'Current',
  'Savings',
  'Cash Credit',
  'Overdraft',
  'Others',
]

export const GSTBankDetails = ({
  data,
  onChange,
  errors = {},
  onClearError,
}: GSTBankDetailsProps) => {
  const handleAccountHolderNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('accountHolderName', gstInput.letters(e.target.value))
    onClearError?.('accountHolderName')
  }

  const handleAccountNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('accountNumber', gstInput.accountNumber(e.target.value))
    onClearError?.('accountNumber')
  }

  const handleIfscChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)
    onChange('ifscCode', cleaned)
    onClearError?.('ifscCode')

    if (cleaned.length >= 4) {
      const match = lookupSampleBankByIfsc(cleaned)
      if (match) {
        onChange('bankName', match.bankName)
        onChange('branch', match.branch)
        onClearError?.('bankName')
        onClearError?.('branch')
      }
    }
  }

  const handleIfscBlur = async () => {
    const cleaned = data.ifscCode?.trim().toUpperCase()
    if (cleaned && cleaned.length >= 4) {
      const match = await fetchBankDetailsByIfsc(cleaned)
      if (match) {
        onChange('bankName', match.bankName)
        onChange('branch', match.branch)
        onClearError?.('bankName')
        onClearError?.('branch')
      }
    }
  }

  const handleBankNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('bankName', gstInput.letters(e.target.value))
    onClearError?.('bankName')
  }

  const handleBranchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange('branch', gstInput.letters(e.target.value))
    onClearError?.('branch')
  }

  const handleAccountTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange('accountType', e.target.value)
    onClearError?.('accountType')
  }

  return (
    <div className="gst-form-card">
      <div className="gst-form-card__header">
        <div className="gst-form-card__icon-badge gst-form-card__icon-badge--orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <h2 className="gst-form-card__title">Bank Details</h2>
      </div>

      <div className="gst-form-card__body">
        {/* Row 1: Account Holder Name (Single Row) */}
        <div className="gst-form-group">
          <label htmlFor="accountHolderName" className="gst-form-label">
            Account Holder Name <span className="gst-required-star">*</span>
          </label>
          <input
            id="accountHolderName"
            type="text"
            className={`gst-form-input ${errors.accountHolderName ? 'gst-input--error' : ''}`}
            placeholder="Enter account holder name"
            value={data.accountHolderName}
            onChange={handleAccountHolderNameChange}
          />
          {errors.accountHolderName && <span className="gst-field-error">{errors.accountHolderName}</span>}
        </div>

        {/* Row 2: Bank Account Number & Confirm Account Number */}
        <div className="gst-form-grid gst-form-grid--2col">
          <div className="gst-form-group">
            <label htmlFor="accountNumber" className="gst-form-label">
              Bank Account Number <span className="gst-required-star">*</span>
            </label>
            <input
              id="accountNumber"
              type="text"
              inputMode="numeric"
              className={`gst-form-input ${errors.accountNumber ? 'gst-input--error' : ''}`}
              placeholder="Enter bank account number"
              value={data.accountNumber}
              onChange={handleAccountNumberChange}
            />
            {errors.accountNumber && <span className="gst-field-error">{errors.accountNumber}</span>}
          </div>

          <div className="gst-form-group">
            <label htmlFor="confirmAccountNumber" className="gst-form-label">
              Confirm Account Number <span className="gst-required-star">*</span>
            </label>
            <ConfirmAccountNumberInput
              id="confirmAccountNumber"
              name="confirmAccountNumber"
              className={`gst-form-input ${errors.confirmAccountNumber ? 'gst-input--error' : ''}`}
              placeholder="Confirm bank account number"
              value={data.confirmAccountNumber}
              onChange={(val) => {
                onChange('confirmAccountNumber', val)
                onClearError?.('confirmAccountNumber')
              }}
              hasError={Boolean(errors.confirmAccountNumber)}
              error={errors.confirmAccountNumber}
            />
          </div>
        </div>

        {/* Row 3: Account Type & IFSC Code */}
        <div className="gst-form-grid gst-form-grid--2col">
          <div className="gst-form-group">
            <label htmlFor="accountType" className="gst-form-label">
              Account Type <span className="gst-required-star">*</span>
            </label>
            <div className="gst-select-wrapper">
              <select
                id="accountType"
                className={`gst-form-select ${!data.accountType ? 'gst-select--placeholder' : ''} ${errors.accountType ? 'gst-input--error' : ''}`}
                data-empty={!data.accountType}
                value={data.accountType}
                onChange={handleAccountTypeChange}
              >
                <option value="">Select account type</option>
                {ACCOUNT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <span className="gst-select-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
            {errors.accountType && <span className="gst-field-error">{errors.accountType}</span>}
          </div>

          <div className="gst-form-group">
            <label htmlFor="ifscCode" className="gst-form-label">
              IFSC Code <span className="gst-required-star">*</span>
            </label>
            <input
              id="ifscCode"
              type="text"
              maxLength={11}
              className={`gst-form-input ${errors.ifscCode ? 'gst-input--error' : ''}`}
              placeholder="Enter IFSC code"
              value={data.ifscCode}
              onChange={handleIfscChange}
              onBlur={handleIfscBlur}
            />
            {errors.ifscCode && <span className="gst-field-error">{errors.ifscCode}</span>}
          </div>
        </div>

        {/* Row 4: Bank Name & Branch */}
        <div className="gst-form-grid gst-form-grid--2col">
          <div className="gst-form-group">
            <label htmlFor="bankName" className="gst-form-label">
              Bank Name <span className="gst-required-star">*</span>
            </label>
            <input
              id="bankName"
              type="text"
              className={`gst-form-input ${errors.bankName ? 'gst-input--error' : ''}`}
              placeholder="Auto-fetched"
              value={data.bankName}
              onChange={handleBankNameChange}
            />
            {errors.bankName && <span className="gst-field-error">{errors.bankName}</span>}
          </div>

          <div className="gst-form-group">
            <label htmlFor="branch" className="gst-form-label">
              Branch <span className="gst-required-star">*</span>
            </label>
            <input
              id="branch"
              name="branch"
              type="text"
              className={`gst-form-input ${errors.branch ? 'gst-input--error' : ''}`}
              placeholder="Enter branch name (auto-filled from IFSC)"
              value={data.branch}
              onChange={handleBranchChange}
              aria-required="true"
              aria-invalid={Boolean(errors.branch)}
            />
            {errors.branch && <span className="gst-field-error">{errors.branch}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GSTBankDetails
