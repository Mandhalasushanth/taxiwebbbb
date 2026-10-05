import React from 'react'
import { UserCheck } from 'lucide-react'
import type { BusinessLoanFormData } from '@modules/loans/types/businessLoan.types'
import {
  formatTextOnly,
  handleTextOnlyKeyDown,
} from '@modules/loans/utils/loanInputFormatters'

export interface AuthorizedSignatoryCardProps {
  data: BusinessLoanFormData
  onChange: (fields: Partial<BusinessLoanFormData>) => void
  errors?: Record<string, string>
}

/**
 * Authorized Signatory Details Card - Name, Designation, and Email
 * Strictly text-only without numeric digits. Loop-free and uses external CSS only.
 */
export const AuthorizedSignatoryCard: React.FC<AuthorizedSignatoryCardProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  return (
    <div className="business-field-card signatory-card">
      <div className="business-field-header">
        <div className="business-field-header__left">
          <div className="business-icon-tile">
            <UserCheck size={20} aria-hidden="true" />
          </div>
          <label className="business-field-title">
            Authorized Signatory Details <span className="text-required">*</span>
          </label>
        </div>
      </div>

      {/* Subrow: Name & Designation */}
      <div className="signatory-subrow">
        <div className="signatory-subfield">
          <label htmlFor="signatoryName" className="signatory-sublabel">
            Name
          </label>
          <input
            id="signatoryName"
            type="text"
            className={`custom-form-input ${errors.signatoryName ? 'custom-form-input--error' : ''}`}
            placeholder="e.g. Ramesh Kumar"
            value={data.signatoryName || ''}
            onChange={(e) => onChange({ signatoryName: formatTextOnly(e.target.value) })}
            onKeyDown={handleTextOnlyKeyDown}
            aria-label="Signatory Name"
          />
          {errors.signatoryName && (
            <span className="field-error-text">{errors.signatoryName}</span>
          )}
        </div>

        <div className="signatory-subfield">
          <label htmlFor="signatoryDesignation" className="signatory-sublabel">
            Designation
          </label>
          <input
            id="signatoryDesignation"
            type="text"
            className={`custom-form-input ${errors.signatoryDesignation ? 'custom-form-input--error' : ''}`}
            placeholder="e.g. Director / Partner"
            value={data.signatoryDesignation || ''}
            onChange={(e) => onChange({ signatoryDesignation: formatTextOnly(e.target.value) })}
            onKeyDown={handleTextOnlyKeyDown}
            aria-label="Signatory Designation"
          />
          {errors.signatoryDesignation && (
            <span className="field-error-text">{errors.signatoryDesignation}</span>
          )}
        </div>
      </div>

      {/* Full-width Email (Optional) */}
      <div className="signatory-subfield">
        <label htmlFor="signatoryEmail" className="signatory-sublabel">
          Email (Optional)
        </label>
        <input
          id="signatoryEmail"
          type="email"
          className={`custom-form-input ${errors.signatoryEmail ? 'custom-form-input--error' : ''}`}
          placeholder="e.g. ramesh@company.com"
          value={data.signatoryEmail || ''}
          onChange={(e) => onChange({ signatoryEmail: e.target.value })}
          aria-label="Signatory Email"
        />
        {errors.signatoryEmail && (
          <span className="field-error-text">{errors.signatoryEmail}</span>
        )}
      </div>
    </div>
  )
}

export default AuthorizedSignatoryCard
