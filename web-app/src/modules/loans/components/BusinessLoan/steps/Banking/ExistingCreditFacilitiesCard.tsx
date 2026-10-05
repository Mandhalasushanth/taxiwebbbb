import React, { useCallback } from 'react'
import { CreditCard, ChevronDown } from 'lucide-react'
import {
  formatCurrencyString,
  handleNumericKeyDown,
} from '@modules/loans/utils/loanInputFormatters'
import type { BusinessLoanFormData } from '@modules/loans/types/businessLoan.types'
import { useDropdown } from '@modules/loans/hooks/useDropdown'
import { LoanDropdownOption } from '../LoanDropdownOption'

export interface ExistingCreditFacilitiesCardProps {
  data: BusinessLoanFormData
  onChange: (fields: Partial<BusinessLoanFormData>) => void
  errors?: Record<string, string>
}

/**
 * Existing Credit Facilities Card
 * Uses useDropdown, LoanDropdownOption, and digits-only validation.
 */
export const ExistingCreditFacilitiesCard: React.FC<ExistingCreditFacilitiesCardProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { isOpen, setIsOpen, dropdownRef } = useDropdown()

  const handleLenderSelect = useCallback(
    (lender: string) => {
      onChange({ currentLenderBank: lender })
      setIsOpen(false)
    },
    [onChange, setIsOpen]
  )

  return (
    <div className="banking-card">
      <div className="banking-card-header">
        <div className="banking-icon-tile">
          <CreditCard size={22} aria-hidden="true" />
        </div>
        <div className="banking-card-header__info">
          <h2 className="banking-card-title">Existing Credit Facilities</h2>
          <p className="banking-card-subtitle">
            Declare any ongoing term loans, cash credit (CC), or overdraft facilities.
          </p>
        </div>
      </div>

      <div className="banking-card-grid">
        {/* Left: Current Lender / Bank Name */}
        <div className="banking-field-item" ref={dropdownRef}>
          <label id="currentLenderLabel" className="banking-field-label">
            Current Lender / Bank <span className="banking-optional-label">(Optional)</span>
          </label>

          <div className="banking-dropdown-container">
            <button
              type="button"
              className={`banking-dropdown-trigger ${isOpen ? 'banking-dropdown-trigger--open' : ''}`}
              onClick={() => setIsOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-labelledby="currentLenderLabel"
              data-testid="current-lender-dropdown"
            >
              <span className={data.currentLenderBank ? 'banking-dropdown-value' : 'banking-dropdown-placeholder'}>
                {data.currentLenderBank || 'Select current lender (if any)'}
              </span>
              <span className={`banking-dropdown-chevron ${isOpen ? 'banking-dropdown-chevron--open' : ''}`} aria-hidden="true">
                <ChevronDown size={18} aria-hidden="true" />
              </span>
            </button>

            {isOpen && (
              <div className="banking-dropdown-menu" role="listbox" aria-labelledby="currentLenderLabel">
                <LoanDropdownOption
                  variant="banking"
                  value="State Bank of India"
                  label="State Bank of India"
                  isSelected={data.currentLenderBank === 'State Bank of India'}
                  onSelect={handleLenderSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="HDFC Bank"
                  label="HDFC Bank"
                  isSelected={data.currentLenderBank === 'HDFC Bank'}
                  onSelect={handleLenderSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="ICICI Bank"
                  label="ICICI Bank"
                  isSelected={data.currentLenderBank === 'ICICI Bank'}
                  onSelect={handleLenderSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Axis Bank (CC/OD)"
                  label="Axis Bank (CC/OD)"
                  isSelected={data.currentLenderBank === 'Axis Bank (CC/OD)'}
                  onSelect={handleLenderSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Kotak Mahindra Bank"
                  label="Kotak Mahindra Bank"
                  isSelected={data.currentLenderBank === 'Kotak Mahindra Bank'}
                  onSelect={handleLenderSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Bajaj Finserv"
                  label="Bajaj Finserv"
                  isSelected={data.currentLenderBank === 'Bajaj Finserv'}
                  onSelect={handleLenderSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Tata Capital"
                  label="Tata Capital"
                  isSelected={data.currentLenderBank === 'Tata Capital'}
                  onSelect={handleLenderSelect}
                />
                <LoanDropdownOption
                  variant="banking"
                  value="Other NBFC / Bank"
                  label="Other NBFC / Bank"
                  isSelected={data.currentLenderBank === 'Other NBFC / Bank'}
                  onSelect={handleLenderSelect}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Total Active Loan Limit (₹) */}
        <div className="banking-field-item">
          <label htmlFor="totalActiveLoanLimit" className="banking-field-label">
            Total Active Loan Limit (₹) (Optional)
          </label>
          <input
            id="totalActiveLoanLimit"
            type="text"
            className={`banking-input ${errors.totalActiveLoanLimit ? 'banking-input--error' : ''}`}
            placeholder="e.g. 2000000"
            value={data.totalActiveLoanLimit || ''}
            onChange={(e) =>
              onChange({ totalActiveLoanLimit: formatCurrencyString(e.target.value) })
            }
            onKeyDown={handleNumericKeyDown}
            aria-label="Total Active Loan Limit"
          />
          {errors.totalActiveLoanLimit && (
            <span className="banking-field-error">{errors.totalActiveLoanLimit}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExistingCreditFacilitiesCard
