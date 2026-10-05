import React, { useCallback } from 'react'
import { Landmark, ChevronDown } from 'lucide-react'
import type { BusinessLoanFormData } from '@modules/loans/types/businessLoan.types'
import { useDropdown } from '@modules/loans/hooks/useDropdown'
import { LoanDropdownOption } from '../LoanDropdownOption'
import {
  formatDigitsOnly,
  formatUppercaseAlphanumeric,
  handleNumericKeyDown,
  LOAN_FIELD_LIMITS,
} from '@modules/loans/utils/loanInputFormatters'

export interface BankingTaxRecordsCardProps {
  data: BusinessLoanFormData
  onChange: (fields: Partial<BusinessLoanFormData>) => void
  errors?: Record<string, string>
}

/**
 * Banking & Tax Records Card
 * Enforces digits-only for account number and uppercase alphanumeric for IFSC with length limits.
 */
export const BankingTaxRecordsCard: React.FC<BankingTaxRecordsCardProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { isOpen, setIsOpen, dropdownRef } = useDropdown()

  const handleBankSelect = useCallback(
    (bank: string) => {
      onChange({ primaryOperatingBankName: bank })
      setIsOpen(false)
    },
    [onChange, setIsOpen]
  )

  return (
    <div className="banking-card">
      <div className="banking-card-header">
        <div className="banking-icon-tile">
          <Landmark size={22} aria-hidden="true" />
        </div>
        <div className="banking-card-header__info">
          <h2 className="banking-card-title">Banking &amp; Tax Records</h2>
          <p className="banking-card-subtitle">
            Provide primary current account details and income tax filing acknowledgment.
          </p>
        </div>
      </div>

      <div className="banking-card-grid">
        {/* Left: Primary Operating Bank Name */}
        <div className="banking-field-item" ref={dropdownRef}>
          <label id="primaryBankLabel" className="banking-field-label">
            Primary Operating Bank Name <span className="text-required">*</span>
          </label>

          <div className="banking-dropdown-container">
            <button
              type="button"
              className={`banking-dropdown-trigger ${isOpen ? 'banking-dropdown-trigger--open' : ''} ${errors.primaryOperatingBankName ? 'banking-dropdown-trigger--error' : ''}`}
              onClick={() => setIsOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-labelledby="primaryBankLabel"
              data-testid="bank-name-dropdown"
            >
              <span className={data.primaryOperatingBankName ? 'banking-dropdown-value' : 'banking-dropdown-placeholder'}>
                {data.primaryOperatingBankName || 'Select bank name'}
              </span>
              <span className={`banking-dropdown-chevron ${isOpen ? 'banking-dropdown-chevron--open' : ''}`} aria-hidden="true">
                <ChevronDown size={18} aria-hidden="true" />
              </span>
            </button>

            {isOpen && (
              <div className="banking-dropdown-menu" role="listbox" aria-labelledby="primaryBankLabel">
                <LoanDropdownOption
                  variant="banking"
                  value="State Bank of India (SBI)"
                  label="State Bank of India (SBI)"
                  isSelected={data.primaryOperatingBankName === 'State Bank of India (SBI)'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="HDFC Bank"
                  label="HDFC Bank"
                  isSelected={data.primaryOperatingBankName === 'HDFC Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="ICICI Bank"
                  label="ICICI Bank"
                  isSelected={data.primaryOperatingBankName === 'ICICI Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Axis Bank"
                  label="Axis Bank"
                  isSelected={data.primaryOperatingBankName === 'Axis Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Kotak Mahindra Bank"
                  label="Kotak Mahindra Bank"
                  isSelected={data.primaryOperatingBankName === 'Kotak Mahindra Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Bank of Baroda"
                  label="Bank of Baroda"
                  isSelected={data.primaryOperatingBankName === 'Bank of Baroda'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Punjab National Bank"
                  label="Punjab National Bank"
                  isSelected={data.primaryOperatingBankName === 'Punjab National Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="IndusInd Bank"
                  label="IndusInd Bank"
                  isSelected={data.primaryOperatingBankName === 'IndusInd Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="IDFC FIRST Bank"
                  label="IDFC FIRST Bank"
                  isSelected={data.primaryOperatingBankName === 'IDFC FIRST Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Yes Bank"
                  label="Yes Bank"
                  isSelected={data.primaryOperatingBankName === 'Yes Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Federal Bank"
                  label="Federal Bank"
                  isSelected={data.primaryOperatingBankName === 'Federal Bank'}
                  onSelect={handleBankSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Other Commercial Bank"
                  label="Other Commercial Bank"
                  isSelected={data.primaryOperatingBankName === 'Other Commercial Bank'}
                  onSelect={handleBankSelect}
                />
              </div>
            )}
          </div>
          {errors.primaryOperatingBankName && (
            <span className="banking-field-error">{errors.primaryOperatingBankName}</span>
          )}
        </div>

        {/* Right: Current Account Number */}
        <div className="banking-field-item">
          <label htmlFor="currentAccountNumber" className="banking-field-label">
            Current Account Number <span className="text-required">*</span>
          </label>
          <input
            id="currentAccountNumber"
            type="text"
            maxLength={LOAN_FIELD_LIMITS.BANK_ACCOUNT_MAX}
            className={`banking-input ${errors.currentAccountNumber ? 'banking-input--error' : ''}`}
            placeholder="Enter current account number"
            value={data.currentAccountNumber || ''}
            onChange={(e) =>
              onChange({
                currentAccountNumber: formatDigitsOnly(e.target.value, LOAN_FIELD_LIMITS.BANK_ACCOUNT_MAX),
              })
            }
            onKeyDown={handleNumericKeyDown}
            aria-label="Current Account Number"
          />
          {errors.currentAccountNumber && (
            <span className="banking-field-error">{errors.currentAccountNumber}</span>
          )}
        </div>

        {/* Row 2 Left: Bank IFSC Code */}
        <div className="banking-field-item">
          <label htmlFor="bankIfscCode" className="banking-field-label">
            Bank IFSC Code <span className="text-required">*</span>
          </label>
          <input
            id="bankIfscCode"
            type="text"
            maxLength={LOAN_FIELD_LIMITS.IFSC}
            className={`banking-input ${errors.bankIfscCode ? 'banking-input--error' : ''}`}
            placeholder="Enter IFSC code"
            value={data.bankIfscCode || ''}
            onChange={(e) =>
              onChange({
                bankIfscCode: formatUppercaseAlphanumeric(e.target.value, LOAN_FIELD_LIMITS.IFSC),
              })
            }
            aria-label="Bank IFSC Code"
          />
          {errors.bankIfscCode && (
            <span className="banking-field-error">{errors.bankIfscCode}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BankingTaxRecordsCard
