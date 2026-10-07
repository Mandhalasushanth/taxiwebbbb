import { CircleUserRound } from 'lucide-react'
import { gstInput, GST_MAX_LENGTH } from '@modules/gst/utils/gstInputFormatters'
import { GSTFormSection } from '@modules/gst/shared/GSTFormSection'
import { GSTDateField, GSTTextField } from '@modules/gst/shared/GSTFormFields'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'

type SignatoryField = 'signatoryName' | 'signatoryPan' | 'dob' | 'designation' | 'signatoryMobile' | 'signatoryEmail'

export interface GSTAuthorisedSignatoryProps {
  data: Pick<GstBusinessFormData, SignatoryField>
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
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

/** Latest selectable date of birth is today; the validator enforces the minimum age */
const todayIso = () => new Date().toISOString().slice(0, 10)

export const GSTAuthorisedSignatory = ({
  data,
  onChange,
  errors = {},
  onClearError,
}: GSTAuthorisedSignatoryProps) => {
  const update = <K extends SignatoryField>(field: K, value: GstBusinessFormData[K]) => {
    onChange(field, value)
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
        onValueChange={(v) => update('signatoryName', gstInput.letters(v))}
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
        />
        <GSTDateField
          id="dob"
          label="Date of Birth"
          max={todayIso()}
          value={data.dob}
          error={errors.dob}
          onValueChange={(v) => update('dob', v)}
        />
      </div>

      <GSTTextField
        id="designation"
        label="Designation"
        placeholder="Proprietor / Director / Partner"
        value={data.designation}
        error={errors.designation}
        onValueChange={(v) => update('designation', gstInput.designation(v))}
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
        />
        <GSTTextField
          id="signatoryEmail"
          label="Signatory Email"
          type="email"
          inputMode="email"
          placeholder="email@business.com"
          value={data.signatoryEmail}
          error={errors.signatoryEmail}
          onValueChange={(v) => update('signatoryEmail', gstInput.email(v))}
        />
      </div>
    </GSTFormSection>
  )
}

export default GSTAuthorisedSignatory
