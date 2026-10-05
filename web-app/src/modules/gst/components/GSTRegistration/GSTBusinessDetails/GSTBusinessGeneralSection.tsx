import React, { type ChangeEvent } from 'react'
import { getCommencementDateBounds } from '@shared/utils'
import { gstInput, GST_MAX_LENGTH } from '@modules/gst/utils/gstInputFormatters'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
import {
  CONSTITUTION_OF_BUSINESS_OPTIONS,
  NATURE_OF_BUSINESS_OPTIONS,
  REASON_FOR_REGISTRATION_OPTIONS,
  COMPOSITION_SCHEME_OPTIONS,
  PLACE_OF_BUSINESS_OPTIONS,
} from '@modules/gst/utils/gstBusinessDetails.constants'
import {
  COMPOSITION_INELIGIBLE_MESSAGE,
  CONSTITUTION_PAN_TYPES,
  getCompositionConflicts,
  isCompositionOpted,
  isOptionBlockedByComposition,
} from '@modules/gst/validation/gstBusinessRules'

type GeneralField =
  | 'legalName'
  | 'tradeName'
  | 'constitution'
  | 'businessPan'
  | 'natureOfBusiness'
  | 'commencementDate'
  | 'registrationReason'
  | 'compositionScheme'
  | 'placeOfBusiness'

export interface GSTBusinessGeneralSectionProps {
  data: Pick<GstBusinessFormData, GeneralField>
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

interface SelectSpec {
  field: Extract<GeneralField, 'constitution' | 'natureOfBusiness' | 'registrationReason' | 'compositionScheme' | 'placeOfBusiness'>
  label: string
  placeholder: string
  options: readonly string[]
}

const SELECTS: Record<SelectSpec['field'], SelectSpec> = {
  constitution: { field: 'constitution', label: 'Constitution of Business', placeholder: 'Select business type', options: CONSTITUTION_OF_BUSINESS_OPTIONS },
  natureOfBusiness: { field: 'natureOfBusiness', label: 'Nature of Business', placeholder: 'Select nature of business', options: NATURE_OF_BUSINESS_OPTIONS },
  registrationReason: { field: 'registrationReason', label: 'Reason for Registration', placeholder: 'Select a reason', options: REASON_FOR_REGISTRATION_OPTIONS },
  compositionScheme: { field: 'compositionScheme', label: 'Opting for Composition Scheme?', placeholder: 'Select yes or no', options: COMPOSITION_SCHEME_OPTIONS },
  placeOfBusiness: { field: 'placeOfBusiness', label: 'Place of Business', placeholder: 'Select place type', options: PLACE_OF_BUSINESS_OPTIONS },
}

const COMPOSITION_RESTRICTED_FIELDS = new Set<SelectSpec['field']>(['natureOfBusiness', 'registrationReason'])

const SelectArrow = () => (
  <span className="gst-select-arrow" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
)

export const GSTBusinessGeneralSection: React.FC<GSTBusinessGeneralSectionProps> = ({
  data,
  onChange,
  errors = {},
  onClearError,
}) => {
  const dateBounds = getCommencementDateBounds()
  const compositionOpted = isCompositionOpted(data)
  const compositionConflicts = getCompositionConflicts(data)
  const hasCompositionConflict = Object.keys(compositionConflicts).length > 0
  const panHint = CONSTITUTION_PAN_TYPES[data.constitution]

  const clearCompositionErrors = () => {
    onClearError?.('natureOfBusiness')
    onClearError?.('registrationReason')
  }

  const update = <K extends GeneralField>(field: K, value: GstBusinessFormData[K]) => {
    onChange(field, value)
    onClearError?.(field)
    // Changing the composition choice can resolve conflicts shown on these fields
    if (field === 'compositionScheme') clearCompositionErrors()
    if (field === 'constitution') onClearError?.('businessPan')
  }

  const fieldError = (field: GeneralField) => errors[field]

  const renderSelect = ({ field, label, placeholder, options }: SelectSpec) => {
    const isRestricted = COMPOSITION_RESTRICTED_FIELDS.has(field)
    const errorId = `${field}-error`
    return (
      <div className="gst-form-group">
        <label htmlFor={field} className="gst-form-label">
          {label} <span className="gst-required-star">*</span>
        </label>
        <div className="gst-select-wrapper">
          <select
            id={field}
            name={field}
            className={`gst-form-select ${!data[field] ? 'gst-select--placeholder' : ''} ${fieldError(field) ? 'gst-input--error' : ''}`}
            data-empty={!data[field]}
            value={data[field]}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => update(field, e.target.value)}
            aria-invalid={Boolean(fieldError(field))}
            aria-describedby={fieldError(field) ? errorId : undefined}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => {
              const blocked = isRestricted && isOptionBlockedByComposition(field as 'natureOfBusiness' | 'registrationReason', opt, data.compositionScheme)
              return (
                <option key={opt} value={opt} disabled={blocked}>
                  {blocked ? `${opt} (not allowed with Composition Scheme)` : opt}
                </option>
              )
            })}
          </select>
          <SelectArrow />
        </div>
        {fieldError(field) && <span id={errorId} className="gst-field-error">{fieldError(field)}</span>}
      </div>
    )
  }

  return (
    <>
      {/* Row 1: Legal Name & Trade Name */}
      <div className="gst-form-grid gst-form-grid--2col">
        <div className="gst-form-group">
          <label htmlFor="legalName" className="gst-form-label">
            Legal Name of Business (as per PAN) <span className="gst-required-star">*</span>
          </label>
          <input
            id="legalName"
            name="legalName"
            type="text"
            className={`gst-form-input ${fieldError('legalName') ? 'gst-input--error' : ''}`}
            placeholder="Exactly as on the PAN card"
            value={data.legalName}
            onChange={(e) => update('legalName', gstInput.businessName(e.target.value))}
            onBlur={() => onChange('legalName', data.legalName.trim())}
          />
          {fieldError('legalName') && <span className="gst-field-error">{fieldError('legalName')}</span>}
        </div>

        <div className="gst-form-group">
          <label htmlFor="tradeName" className="gst-form-label">
            Trade Name <span className="gst-required-star">*</span>
          </label>
          <input
            id="tradeName"
            name="tradeName"
            type="text"
            className={`gst-form-input ${fieldError('tradeName') ? 'gst-input--error' : ''}`}
            placeholder="Enter your business / trade name"
            value={data.tradeName}
            onChange={(e) => update('tradeName', gstInput.businessName(e.target.value))}
            onBlur={() => onChange('tradeName', data.tradeName.trim())}
          />
          {fieldError('tradeName') && <span className="gst-field-error">{fieldError('tradeName')}</span>}
        </div>
      </div>

      {/* Row 2: Constitution & Business PAN (PAN type must match the constitution) */}
      <div className="gst-form-grid gst-form-grid--2col">
        {renderSelect(SELECTS.constitution)}

        <div className="gst-form-group">
          <label htmlFor="businessPan" className="gst-form-label">
            Business PAN <span className="gst-required-star">*</span>
          </label>
          <input
            id="businessPan"
            name="businessPan"
            type="text"
            maxLength={GST_MAX_LENGTH.pan}
            className={`gst-form-input ${fieldError('businessPan') ? 'gst-input--error' : ''}`}
            placeholder={panHint ? `PAN of the business (4th letter ${panHint.join(' / ')})` : 'PAN of the business'}
            value={data.businessPan}
            onChange={(e) => update('businessPan', gstInput.pan(e.target.value))}
            autoCapitalize="characters"
          />
          {fieldError('businessPan') && <span className="gst-field-error">{fieldError('businessPan')}</span>}
        </div>
      </div>

      {/* Row 3: Nature of Business & Date of Commencement */}
      <div className="gst-form-grid gst-form-grid--2col">
        {renderSelect(SELECTS.natureOfBusiness)}

        <div className="gst-form-group">
          <label htmlFor="commencementDate" className="gst-form-label">
            Date of Commencement of Business <span className="gst-required-star">*</span>
          </label>
          <div className="gst-date-input-wrapper">
            <input
              id="commencementDate"
              name="commencementDate"
              type="date"
              min={dateBounds.min}
              max={dateBounds.max}
              className={`gst-form-input gst-form-input--date ${!data.commencementDate ? 'gst-date--placeholder' : 'has-value'} ${fieldError('commencementDate') ? 'gst-input--error' : ''}`}
              placeholder="DD-MM-YYYY"
              value={data.commencementDate}
              onChange={(e) => update('commencementDate', e.target.value)}
            />
          </div>
          {fieldError('commencementDate') && <span className="gst-field-error">{fieldError('commencementDate')}</span>}
        </div>
      </div>

      {/* Row 4: Composition Scheme & Reason for Registration */}
      <div className="gst-form-grid gst-form-grid--2col">
        {renderSelect(SELECTS.compositionScheme)}
        {renderSelect(SELECTS.registrationReason)}
      </div>

      {compositionOpted && (
        <p
          className={`gst-composition-note ${hasCompositionConflict ? 'gst-composition-note--error' : ''}`}
          role={hasCompositionConflict ? 'alert' : 'note'}
        >
          {hasCompositionConflict
            ? COMPOSITION_INELIGIBLE_MESSAGE
            : 'Composition Scheme: e-commerce sales, inter-state supplies and exports are not allowed, so those options are disabled.'}
        </p>
      )}

      {/* Row 5: Place of Business */}
      <div className="gst-form-grid gst-form-grid--2col">{renderSelect(SELECTS.placeOfBusiness)}</div>
    </>
  )
}
