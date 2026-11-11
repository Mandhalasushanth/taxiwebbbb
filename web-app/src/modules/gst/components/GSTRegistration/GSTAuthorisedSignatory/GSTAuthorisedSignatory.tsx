import { CircleUserRound } from 'lucide-react'
import { gstInput, GST_MAX_LENGTH } from '@modules/gst/utils/gstInputFormatters'
import { GSTFormSection } from '@modules/gst/shared/GSTFormSection'
import { GSTDateField, GSTTextField } from '@modules/gst/shared/GSTFormFields'
import { getMaxAdultDobIso } from '@shared/utils/dateUtils'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'

type SignatoryField = 'signatoryName' | 'signatoryPan' | 'dob' | 'designation' | 'signatoryMobile' | 'signatoryEmail'

export interface GSTAuthorisedSignatoryProps {
  data: Pick<GstBusinessFormData, SignatoryField>
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  onBlur?: (field: keyof GstBusinessFormData) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

const SIGNATORY_FIELDS: readonly SignatoryField[] = [
  'signatoryName',
  'signatoryPan',
  'dob',
  'designation',
  'signatoryMobile',
  'signatoryEmail',
]

export const GSTAuthorisedSignatory = ({
  data,
  onChange,
  onBlur,
  errors = {},
  onClearError,
}: GSTAuthorisedSignatoryProps) => {
  const update = <K extends SignatoryField>(field: K, value: GstBusinessFormData[K]) => {
    onChange(field, value)
    if (field === 'designation' && typeof value === 'string' && /\d/.test(value)) {
      return
    }
    if (field === 'dob') {
      return
    }
    onClearError?.(field)
  }

  return (
    <GSTFormSection
      id="gst-authorised-signatory"
      icon={<CircleUserRound />}
      title="Authorised Signatory"
      subtitle="Primary contact & PAN verification"
      fields={SIGNATORY_FIELDS}
      errors={errors}
      collapsible
    >
      <GSTTextField
        id="signatoryName"
        label="Signatory Name"
        placeholder="Full name"
        value={data.signatoryName}
        error={errors.signatoryName}
        onValueChange={(v) => update('signatoryName', gstInput.personName(v))}
        onBlur={() => {
          onChange('signatoryName', data.signatoryName.trim())
          onBlur?.('signatoryName')
        }}
      />

      <div className="gst-form-row gst-form-row--pair">
        <GSTTextField
          id="signatoryPan"
          label="Signatory PAN"
          placeholder="ABCDE1234F"
          maxLength={GST_MAX_LENGTH.pan}
          autoCapitalize="characters"
          value={data.signatoryPan}
          error={errors.signatoryPan}
          onValueChange={(v) => update('signatoryPan', gstInput.pan(v))}
          onBlur={() => {
            onChange('signatoryPan', data.signatoryPan.trim().toUpperCase())
            onBlur?.('signatoryPan')
          }}
        />
        <GSTDateField
          id="dob"
          label="Date of Birth"
          max={getMaxAdultDobIso(18)}
          value={data.dob}
          error={errors.dob}
          onValueChange={(v) => update('dob', v)}
          onBlur={() => onBlur?.('dob')}
        />
      </div>

      <GSTTextField
        id="designation"
        label="Designation"
        placeholder="Proprietor / Director / Partner"
        value={data.designation}
        error={errors.designation}
        onValueChange={(v) => update('designation', v)}
        onBlur={() => {
          onChange('designation', data.designation.trim())
          onBlur?.('designation')
        }}
      />

      <div className="gst-form-row gst-form-row--pair">
        <GSTTextField
          id="signatoryMobile"
          label="Signatory Mobile"
          type="tel"
          inputMode="numeric"
          placeholder="10-digit"
          value={data.signatoryMobile}
          error={errors.signatoryMobile}
          onValueChange={(v) => update('signatoryMobile', gstInput.mobile(v))}
          onBlur={() => onBlur?.('signatoryMobile')}
        />
        <GSTTextField
          id="signatoryEmail"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          label="Signatory Email"
          type="email"
          inputMode="email"
          placeholder="email@business.com"
          value={data.signatoryEmail}
          error={errors.signatoryEmail}
          onValueChange={(v) => update('signatoryEmail', gstInput.email(v))}
          onBlur={() => {
            onChange('signatoryEmail', data.signatoryEmail.trim())
            onBlur?.('signatoryEmail')
          }}
        />
      </div>
    </GSTFormSection>
  )
}

export default GSTAuthorisedSignatory
