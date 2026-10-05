import React, { useMemo } from 'react'
import { gstFieldRules } from '@modules/gst/validation/gstFieldRules'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import {
  FINANCIAL_YEAR_OPTIONS,
  RETURN_TYPE_OPTIONS,
  type SelectOption,
} from '@modules/gst/utils/gstPeriodOptions'
import { GSTVerifiedBusinessCard } from './GSTVerifiedBusinessCard'

export const ChevronDown: React.FC = () => (
  <svg
    className="gst-filing-period__chevron"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export interface GSTPeriodFieldsProps {
  financialYear: string
  setFinancialYear: (fy: string) => void
  returnPeriod: string
  setReturnPeriod: (p: string) => void
  gstin: string
  setGstin: (g: string) => void
  returnType: string
  setReturnType: (t: string) => void
  filingType: 'regular' | 'nil' | ''
  periodOptions: SelectOption[]
  errors: Record<string, string>
  handleClearError: (field: string) => void
}

export const GSTPeriodFields: React.FC<GSTPeriodFieldsProps> = ({
  financialYear,
  setFinancialYear,
  returnPeriod,
  setReturnPeriod,
  gstin,
  setGstin,
  returnType,
  setReturnType,
  filingType,
  periodOptions,
  errors,
  handleClearError,
}) => {
  const profile = useMemo(() => gstProfileService.get(), [])
  return (
    <>
      {/* Financial Year */}
      <div className="gst-filing-period__field">
        <label htmlFor="gst-fy" className="gst-filing-period__label">
          Financial Year *
        </label>
        <div className="gst-filing-period__select-wrap">
          <select
            id="gst-fy"
            className={`gst-filing-period__select ${!financialYear ? 'gst-filing-period__select--placeholder' : ''}`}
            value={financialYear}
            onChange={(e) => {
              setFinancialYear(e.target.value)
              handleClearError('financialYear')
            }}
          >
            <option value="">Select Financial Year</option>
            {FINANCIAL_YEAR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
        {errors.financialYear && (
          <span className="gst-filing-period__error-text">{errors.financialYear}</span>
        )}
      </div>

      {/* Filing Period / Return Period */}
      <div className="gst-filing-period__field">
        <label htmlFor="gst-return-period" className="gst-filing-period__label">
          Filing Period / Return Period *
        </label>
        <div className="gst-filing-period__select-wrap">
          <input
            id="gst-return-period"
            type="text"
            list="gst-period-options"
            className="gst-filing-period__input"
            placeholder="Select or enter filing period"
            value={returnPeriod}
            onChange={(e) => {
              setReturnPeriod(e.target.value)
              handleClearError('returnPeriod')
            }}
          />
          <datalist id="gst-period-options">
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value} />
            ))}
          </datalist>
          <ChevronDown />
        </div>
        {errors.returnPeriod && (
          <span className="gst-filing-period__error-text">{errors.returnPeriod}</span>
        )}
      </div>

      {/* GSTIN (15-Character) */}
      <div className="gst-filing-period__field">
        <label htmlFor="gst-gstin" className="gst-filing-period__label">
          GSTIN (15-Character) *
        </label>
        <input
          id="gst-gstin"
          type="text"
          maxLength={15}
          className="gst-filing-period__input"
          placeholder="Enter your GSTIN"
          value={gstin}
          onChange={(e) => {
            setGstin(gstInput.gstin(e.target.value))
            handleClearError('gstin')
          }}
        />
        {errors.gstin && (
          <span className="gst-filing-period__error-text">{errors.gstin}</span>
        )}

        {/* Verified Business Card appears when user enters GST number */}
        {!gstFieldRules.gstin(gstin) && (
          <GSTVerifiedBusinessCard
            gstin={gstin}
            tradeName={profile.tradeName}
            legalName={profile.legalName}
            scheme={filingType === 'nil' ? 'Nil Return' : 'Regular Scheme'}
          />
        )}
      </div>

      {/* Filing Return Type */}
      <div className="gst-filing-period__field">
        <label htmlFor="gst-return-type" className="gst-filing-period__label">
          Filing Return Type *
        </label>
        <div className="gst-filing-period__select-wrap">
          <select
            id="gst-return-type"
            className={`gst-filing-period__select ${!returnType ? 'gst-filing-period__select--placeholder' : ''}`}
            value={returnType}
            onChange={(e) => {
              setReturnType(e.target.value)
              handleClearError('returnType')
            }}
          >
            <option value="">Select return type</option>
            {RETURN_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
        {errors.returnType && (
          <span className="gst-filing-period__error-text">{errors.returnType}</span>
        )}
      </div>
    </>
  )
}
