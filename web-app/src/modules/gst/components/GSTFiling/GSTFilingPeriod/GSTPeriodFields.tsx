import React, { useMemo } from 'react'
import { CaretInput, FieldInfoTooltip } from '@shared/components'
import { gstFieldRules } from '@modules/gst/validation/gstFieldRules'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { gstProfileService } from '@modules/gst/services/gstProfileService'
import {
  GST_FILING_FINANCIAL_YEAR_OPTIONS,
  getReturnTypeOptions,
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

export interface GSTPeriodSelectionFieldsProps {
  frequency?: string
  financialYear: string
  setFinancialYear: (fy: string) => void
  returnPeriod: string
  setReturnPeriod: (p: string) => void
  periodOptions: SelectOption[]
  errors: Record<string, string>
  handleClearError: (field: string) => void
  onBlurField?: (field: string) => void
}

export const GSTPeriodSelectionFields: React.FC<GSTPeriodSelectionFieldsProps> = ({
  frequency,
  financialYear,
  setFinancialYear,
  returnPeriod,
  setReturnPeriod,
  periodOptions,
  errors,
  handleClearError,
  onBlurField,
}) => {
  const periodLabel = 'Filing Period / Return Period'

  const periodPlaceholder = !frequency
    ? 'Select filing frequency first'
    : 'Select return period'

  return (
    <>
      {/* Financial Year */}
      <div className="gst-filing-period__field">
        <label htmlFor="gst-fy" className="gst-filing-period__label">
          Financial Year <span className="gst-filing-period__required">*</span>
        </label>
        <div className="gst-filing-period__select-wrap">
          <select
            id="gst-fy"
            className={`gst-filing-period__select ${!financialYear ? 'gst-filing-period__select--placeholder' : ''}`}
            value={
              GST_FILING_FINANCIAL_YEAR_OPTIONS.some((o) => o.value === financialYear)
                ? financialYear
                : GST_FILING_FINANCIAL_YEAR_OPTIONS.some((o) => o.value === `FY ${financialYear}`)
                  ? `FY ${financialYear}`
                  : financialYear
            }
            onChange={(e) => {
              setFinancialYear(e.target.value)
              handleClearError('financialYear')
            }}
            onBlur={() => onBlurField?.('financialYear')}
          >
            <option value="">Select Financial Year</option>
            {GST_FILING_FINANCIAL_YEAR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
        <p className="gst-filing-period__hint">
          Historical periods are available based on GST portal eligibility and filing rules.
        </p>
        {errors.financialYear && (
          <span className="gst-filing-period__error-text">{errors.financialYear}</span>
        )}
      </div>

      {/* Filing Period / Return Period */}
      <div className="gst-filing-period__field">
        <label htmlFor="gst-return-period" className="gst-filing-period__label">
          {periodLabel} <span className="gst-filing-period__required">*</span>
        </label>
        <div className="gst-filing-period__select-wrap">
          <select
            id="gst-return-period"
            className={`gst-filing-period__select ${!returnPeriod ? 'gst-filing-period__select--placeholder' : ''}`}
            value={returnPeriod}
            onChange={(e) => {
              setReturnPeriod(e.target.value)
              handleClearError('returnPeriod')
            }}
            onBlur={() => onBlurField?.('returnPeriod')}
          >
            <option value="">{periodPlaceholder}</option>
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
        {errors.returnPeriod && (
          <span className="gst-filing-period__error-text">{errors.returnPeriod}</span>
        )}
      </div>
    </>
  )
}

export interface GSTTaxpayerReturnFieldsProps {
  frequency?: string
  gstin: string
  setGstin: (g: string) => void
  returnType: string
  setReturnType: (t: string) => void
  filingType: 'regular' | 'nil' | ''
  errors: Record<string, string>
  handleClearError: (field: string) => void
  onBlurField?: (field: string) => void
}

export const GSTTaxpayerReturnFields: React.FC<GSTTaxpayerReturnFieldsProps> = ({
  frequency,
  gstin,
  setGstin,
  returnType,
  setReturnType,
  filingType,
  errors,
  handleClearError,
  onBlurField,
}) => {
  const profile = useMemo(() => gstProfileService.get(), [])
  const returnTypeOptions = useMemo(() => getReturnTypeOptions(frequency), [frequency])

  return (
    <>
      {/* GSTIN (15-Character) */}
      <div className="gst-filing-period__field">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <label htmlFor="gst-gstin" className="gst-filing-period__label" style={{ marginBottom: 0 }}>
            GSTIN (15-Character) <span className="gst-filing-period__required">*</span>
          </label>
          <FieldInfoTooltip
            title="GSTIN Information"
            description="Enter your valid 15-digit GST Identification Number. Ensure it matches your GST registration."
          />
        </div>
        <CaretInput
          id="gst-gstin"
          type="text"
          maxLength={15}
          className="gst-filing-period__input"
          placeholder="Enter your GSTIN number"
          value={gstin}
          onChange={(e) => {
            setGstin(gstInput.gstin(e.target.value))
          }}
          onBlur={() => onBlurField?.('gstin')}
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
          Filing Return Type <span className="gst-filing-period__required">*</span>
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
            onBlur={() => onBlurField?.('returnType')}
          >
            <option value="">Select return type</option>
            {returnTypeOptions.map((opt) => (
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

export interface GSTPeriodFieldsProps extends GSTPeriodSelectionFieldsProps, GSTTaxpayerReturnFieldsProps {}

export const GSTPeriodFields: React.FC<GSTPeriodFieldsProps> = (props) => {
  return (
    <>
      <GSTPeriodSelectionFields
        frequency={props.frequency}
        financialYear={props.financialYear}
        setFinancialYear={props.setFinancialYear}
        returnPeriod={props.returnPeriod}
        setReturnPeriod={props.setReturnPeriod}
        periodOptions={props.periodOptions}
        errors={props.errors}
        handleClearError={props.handleClearError}
      />
      <GSTTaxpayerReturnFields
        frequency={props.frequency}
        gstin={props.gstin}
        setGstin={props.setGstin}
        returnType={props.returnType}
        setReturnType={props.setReturnType}
        filingType={props.filingType}
        errors={props.errors}
        handleClearError={props.handleClearError}
        onBlurField={props.onBlurField}
      />
    </>
  )
}
