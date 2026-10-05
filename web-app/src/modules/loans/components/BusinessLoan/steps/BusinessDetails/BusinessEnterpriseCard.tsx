import React from 'react'
import { Building2, FileCheck, Calendar, ChevronDown } from 'lucide-react'
import type { BusinessLoanFormData } from '@modules/loans/types/businessLoan.types'
import { useDropdown } from '@modules/loans/hooks/useDropdown'
import { LoanDropdownOption } from '../LoanDropdownOption'
import {
  formatUppercaseAlphanumeric,
  LOAN_FIELD_LIMITS,
} from '@modules/loans/utils/loanInputFormatters'

export interface BusinessEnterpriseCardProps {
  data: BusinessLoanFormData
  onChange: (fields: Partial<BusinessLoanFormData>) => void
  errors?: Record<string, string>
}

/**
 * Business Enterprise Card - Business Name, GSTIN, and Business Vintage
 * Enforces uppercase alphanumeric GSTIN and max length limits.
 */
export const BusinessEnterpriseCard: React.FC<BusinessEnterpriseCardProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { isOpen: isVintageOpen, setIsOpen: setIsVintageOpen, dropdownRef: vintageRef } = useDropdown()

  const handleVintageSelect = (val: string) => {
    onChange({ businessVintage: val })
    setIsVintageOpen(false)
  }

  return (
    <>
      {/* 1. Registered Business / Firm Name */}
      <div className="business-field-card">
        <div className="business-field-header">
          <div className="business-field-header__left">
            <div className="business-icon-tile">
              <Building2 size={20} aria-hidden="true" />
            </div>
            <label htmlFor="registeredBusinessName" className="business-field-title">
              Registered Business / Firm Name <span className="text-required">*</span>
            </label>
          </div>
        </div>

        <input
          id="registeredBusinessName"
          type="text"
          className={`custom-form-input ${errors.registeredBusinessName ? 'custom-form-input--error' : ''}`}
          placeholder="e.g. Apex Enterprises Pvt Ltd"
          value={data.registeredBusinessName || ''}
          onChange={(e) => onChange({ registeredBusinessName: e.target.value })}
          aria-label="Registered Business or Firm Name"
        />
        {errors.registeredBusinessName && (
          <span className="field-error-text">{errors.registeredBusinessName}</span>
        )}
      </div>

      {/* 2. GSTIN */}
      <div className="business-field-card">
        <div className="business-field-header">
          <div className="business-field-header__left">
            <div className="business-icon-tile">
              <FileCheck size={20} aria-hidden="true" />
            </div>
            <label htmlFor="gstin" className="business-field-title">
              GSTIN <span className="text-required">*</span>
            </label>
          </div>
        </div>

        <input
          id="gstin"
          type="text"
          maxLength={LOAN_FIELD_LIMITS.GSTIN}
          className={`custom-form-input ${errors.gstin ? 'custom-form-input--error' : ''}`}
          placeholder="e.g. 27ABCDE1234F1Z5"
          value={data.gstin || ''}
          onChange={(e) =>
            onChange({
              gstin: formatUppercaseAlphanumeric(e.target.value, LOAN_FIELD_LIMITS.GSTIN),
            })
          }
          aria-label="GSTIN"
        />
        <span className="input-field-subtext">15-character Goods &amp; Services Tax Number</span>
        {errors.gstin && <span className="field-error-text">{errors.gstin}</span>}
      </div>

      {/* 3. Business Vintage (Years in Operation) */}
      <div className="business-field-card" ref={vintageRef}>
        <div className="business-field-header">
          <div className="business-field-header__left">
            <div className="business-icon-tile">
              <Calendar size={20} aria-hidden="true" />
            </div>
            <label id="vintageLabel" className="business-field-title">
              Business Vintage (Years in Operation) <span className="text-required">*</span>
            </label>
          </div>
        </div>

        <div className="custom-dropdown-container">
          <button
            type="button"
            className={`custom-dropdown-trigger ${isVintageOpen ? 'custom-dropdown-trigger--open' : ''} ${errors.businessVintage ? 'custom-dropdown-trigger--error' : ''}`}
            onClick={() => setIsVintageOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isVintageOpen}
            aria-labelledby="vintageLabel"
            data-testid="business-vintage-dropdown"
          >
            <span className={data.businessVintage ? 'custom-dropdown-value' : 'custom-dropdown-placeholder'}>
              {data.businessVintage || 'Select Business Vintage'}
            </span>
            <span className={`custom-dropdown-chevron ${isVintageOpen ? 'custom-dropdown-chevron--open' : ''}`} aria-hidden="true">
              <ChevronDown size={18} aria-hidden="true" />
            </span>
          </button>

          {isVintageOpen && (
            <div className="custom-dropdown-menu" role="listbox" aria-labelledby="vintageLabel">
              <LoanDropdownOption
                value="< 1 Year"
                label="< 1 Year"
                isSelected={data.businessVintage === '< 1 Year'}
                onSelect={handleVintageSelect}
              />
              <LoanDropdownOption
                value="1–2 Years"
                label="1–2 Years"
                isSelected={data.businessVintage === '1–2 Years'}
                onSelect={handleVintageSelect}
              />
              <LoanDropdownOption
                value="3–5 Years"
                label="3–5 Years"
                isSelected={data.businessVintage === '3–5 Years'}
                onSelect={handleVintageSelect}
              />
              <LoanDropdownOption
                value="5–10 Years"
                label="5–10 Years"
                isSelected={data.businessVintage === '5–10 Years'}
                onSelect={handleVintageSelect}
              />
              <LoanDropdownOption
                value="10+ Years"
                label="10+ Years"
                isSelected={data.businessVintage === '10+ Years'}
                onSelect={handleVintageSelect}
              />
            </div>
          )}
        </div>
        {errors.businessVintage && (
          <span className="field-error-text">{errors.businessVintage}</span>
        )}
      </div>
    </>
  )
}

export default BusinessEnterpriseCard
