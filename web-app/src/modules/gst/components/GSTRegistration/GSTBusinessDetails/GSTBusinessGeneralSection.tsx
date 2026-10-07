import React from 'react'
import { Award, Store } from 'lucide-react'
import { getCommencementDateBounds } from '@shared/utils'
import { gstInput, GST_MAX_LENGTH } from '@modules/gst/utils/gstInputFormatters'
import { GSTFormSection } from '@modules/gst/shared/GSTFormSection'
import { GSTDateField, GSTSelectField, GSTTextField } from '@modules/gst/shared/GSTFormFields'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
import {
  CONSTITUTION_OF_BUSINESS_OPTIONS,
  NATURE_OF_BUSINESS_OPTIONS,
  REASON_FOR_REGISTRATION_OPTIONS,
  COMPOSITION_SCHEME_OPTIONS,
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

export interface GSTBusinessGeneralSectionProps {
  data: Pick<GstBusinessFormData, GeneralField>
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

const IDENTITY_FIELDS = ['legalName', 'tradeName', 'constitution', 'businessPan', 'natureOfBusiness', 'commencementDate'] as const
const SCHEME_FIELDS = ['registrationReason', 'compositionScheme'] as const

const COMPOSITION_ALLOWED_NOTE =
  'Composition Scheme: e-commerce sales, inter-state supplies and exports are not allowed, so those options are disabled.'

/** Updates a field and clears the errors that the change can resolve */
const createGeneralFieldUpdater = ({ onChange, onClearError }: GSTBusinessGeneralSectionProps) =>
  <K extends GeneralField>(field: K, value: GstBusinessFormData[K]) => {
    onChange(field, value)
    onClearError?.(field)
    if (field === 'compositionScheme') {
      onClearError?.('natureOfBusiness')
      onClearError?.('registrationReason')
    }
    if (field === 'constitution') onClearError?.('businessPan')
  }

/** Option state for selects restricted by the Composition Scheme choice */
const compositionOptionState =
  (field: 'natureOfBusiness' | 'registrationReason', compositionScheme: string) => (option: string) => {
    const blocked = isOptionBlockedByComposition(field, option, compositionScheme)
    return { disabled: blocked, label: blocked ? `${option} (not allowed with Composition Scheme)` : option }
  }

export const GSTBusinessIdentitySection: React.FC<GSTBusinessGeneralSectionProps> = (props) => {
  const { data, onChange, errors = {} } = props
  const update = createGeneralFieldUpdater(props)
  const dateBounds = getCommencementDateBounds()
  const panHint = CONSTITUTION_PAN_TYPES[data.constitution]
  const panPlaceholder = panHint ? `PAN of the business (4th letter ${panHint.join(' / ')})` : 'ABCDE1234F'

  return (
    <GSTFormSection
      id="gst-business-identity"
      icon={<Store />}
      title="Business Identity"
      subtitle="Legal name and constitutional details"
      fields={IDENTITY_FIELDS}
      errors={errors}
    >
      <div className="gst-form-row gst-form-row--split">
        <GSTTextField
          id="legalName"
          label="Legal Name of Business (as per PAN)"
          placeholder="Exactly as on the PAN card"
          value={data.legalName}
          error={errors.legalName}
          onValueChange={(v) => update('legalName', gstInput.businessName(v))}
          onBlur={() => onChange('legalName', data.legalName.trim())}
        />
        <GSTTextField
          id="tradeName"
          label="Trade Name"
          placeholder="Enter your business / trade name"
          value={data.tradeName}
          error={errors.tradeName}
          onValueChange={(v) => update('tradeName', gstInput.businessName(v))}
          onBlur={() => onChange('tradeName', data.tradeName.trim())}
        />
      </div>

      <div className="gst-form-row gst-form-row--split">
        <GSTSelectField
          id="constitution"
          label="Constitution of Business"
          placeholder="Select business type"
          options={CONSTITUTION_OF_BUSINESS_OPTIONS}
          value={data.constitution}
          error={errors.constitution}
          onValueChange={(v) => update('constitution', v)}
        />
        <GSTTextField
          id="businessPan"
          label="Business PAN"
          placeholder={panPlaceholder}
          maxLength={GST_MAX_LENGTH.pan}
          autoCapitalize="characters"
          value={data.businessPan}
          error={errors.businessPan}
          onValueChange={(v) => update('businessPan', gstInput.pan(v))}
        />
      </div>

      <div className="gst-form-row gst-form-row--split">
        <GSTSelectField
          id="natureOfBusiness"
          label="Nature of Business"
          placeholder="Select nature of business"
          options={NATURE_OF_BUSINESS_OPTIONS}
          value={data.natureOfBusiness}
          error={errors.natureOfBusiness}
          onValueChange={(v) => update('natureOfBusiness', v)}
          getOptionState={compositionOptionState('natureOfBusiness', data.compositionScheme)}
        />
        <GSTDateField
          id="commencementDate"
          label="Date of Commencement of Business"
          min={dateBounds.min}
          max={dateBounds.max}
          value={data.commencementDate}
          error={errors.commencementDate}
          onValueChange={(v) => update('commencementDate', v)}
        />
      </div>
    </GSTFormSection>
  )
}

export const GSTRegistrationSchemeSection: React.FC<GSTBusinessGeneralSectionProps> = (props) => {
  const { data, errors = {} } = props
  const update = createGeneralFieldUpdater(props)
  const compositionOpted = isCompositionOpted(data)
  const hasCompositionConflict = Object.keys(getCompositionConflicts(data)).length > 0
  const noteClass = `gst-composition-note ${hasCompositionConflict ? 'gst-composition-note--error' : ''}`

  return (
    <GSTFormSection
      id="gst-registration-scheme"
      icon={<Award />}
      title="Registration & Scheme"
      subtitle="Registration purpose and tax scheme"
      fields={SCHEME_FIELDS}
      errors={errors}
    >
      <div className="gst-form-row gst-form-row--split">
        <GSTSelectField
          id="registrationReason"
          label="Reason for Registration"
          placeholder="Select a reason"
          options={REASON_FOR_REGISTRATION_OPTIONS}
          value={data.registrationReason}
          error={errors.registrationReason}
          onValueChange={(v) => update('registrationReason', v)}
          getOptionState={compositionOptionState('registrationReason', data.compositionScheme)}
        />
        <GSTSelectField
          id="compositionScheme"
          label="Opting for Composition Scheme?"
          placeholder="Select yes or no"
          options={COMPOSITION_SCHEME_OPTIONS}
          value={data.compositionScheme}
          error={errors.compositionScheme}
          onValueChange={(v) => update('compositionScheme', v)}
        />
      </div>

      {compositionOpted && (
        <p className={noteClass} role={hasCompositionConflict ? 'alert' : 'note'}>
          {hasCompositionConflict ? COMPOSITION_INELIGIBLE_MESSAGE : COMPOSITION_ALLOWED_NOTE}
        </p>
      )}
    </GSTFormSection>
  )
}
