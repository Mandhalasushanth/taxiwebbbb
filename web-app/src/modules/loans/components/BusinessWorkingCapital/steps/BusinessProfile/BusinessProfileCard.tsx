import React from 'react'
import { Store } from 'lucide-react'
import type { BusinessWorkingCapitalStepProps, YesNoChoice } from '@modules/loans/types/businessWorkingCapital.types'
import { FormTextField } from '../FormTextField'
import { InlineSelect } from '../InlineSelect'
import {
  BUSINESS_ACTIVITY_OPTIONS,
  BUSINESS_PROFILE_COPY as COPY,
  BUSINESS_PROFILE_LIMITS as L,
  CONSTITUTION_OPTIONS,
} from './businessProfile.constants'
import { BUSINESS_PROFILE_INPUT, todayIso } from './businessProfileInput'
import type { BusinessProfileTextField } from './businessProfileInput'

const GST_CHOICES: { value: Exclude<YesNoChoice, ''>; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

/** Registered entity details, operating address, GST and Udyam */
export const BusinessProfileCard: React.FC<Required<BusinessWorkingCapitalStepProps>> = ({ data, onChange, errors }) => {
  const setText = (field: BusinessProfileTextField) => (value: string) =>
    onChange({ [field]: BUSINESS_PROFILE_INPUT[field](value) })

  const handleGstChoice = (gstRegistered: YesNoChoice) =>
    onChange({ gstRegistered, gstin: gstRegistered === 'yes' ? data.gstin : '' })

  return (
    <section className="bwc-card" aria-labelledby="bwc-profile-title">
      <div className="bwc-card__header">
        <span className="bwc-card__icon bwc-card__icon--navy">
          <Store size={20} aria-hidden="true" />
        </span>
        <h2 id="bwc-profile-title" className="bwc-card__title">
          {COPY.profileTitle}
        </h2>
      </div>
      <p className="bwc-card__subtitle">{COPY.profileSubtitle}</p>

      <FormTextField
        id="bwc-business-name"
        label="Business / Trade Name"
        placeholder="e.g. Apex Enterprises"
        autoComplete="organization"
        maxLength={L.businessName}
        value={data.businessName}
        onChange={setText('businessName')}
        error={errors.businessName}
      />
      <InlineSelect
        id="bwc-constitution"
        label="Business Constitution"
        placeholder="Select legal entity constitution"
        options={CONSTITUTION_OPTIONS}
        value={data.businessConstitution}
        onChange={(businessConstitution) => onChange({ businessConstitution })}
        error={errors.businessConstitution}
      />
      <InlineSelect
        id="bwc-activity"
        label="Primary Business Activity"
        placeholder="Select core operational sector"
        options={BUSINESS_ACTIVITY_OPTIONS}
        value={data.businessActivity}
        onChange={(businessActivity) => onChange({ businessActivity })}
        error={errors.businessActivity}
      />
      <FormTextField
        id="bwc-establishment-date"
        label="Business Establishment Date"
        type="date"
        max={todayIso()}
        value={data.establishmentDate}
        onChange={(establishmentDate) => onChange({ establishmentDate })}
        hint={COPY.establishmentHint}
        error={errors.establishmentDate}
      />
      <FormTextField
        id="bwc-operating-address"
        label="Business Operating Address"
        placeholder="Plot/Shop No, Commercial Complex, Street, City"
        multiline
        maxLength={L.operatingAddress}
        value={data.operatingAddress}
        onChange={setText('operatingAddress')}
        error={errors.operatingAddress}
      />
      <FormTextField
        id="bwc-business-pincode"
        label="PIN Code"
        placeholder="6 digits"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={L.pincode}
        value={data.businessPincode}
        onChange={setText('businessPincode')}
        error={errors.businessPincode}
      />

      <div className="bwc-field">
        <span id="bwc-gst-question" className="bwc-field__label">
          {COPY.gstQuestion}
        </span>
        <div className="bwc-toggle__options" role="radiogroup" aria-labelledby="bwc-gst-question">
          {GST_CHOICES.map((choice) => {
            const isActive = data.gstRegistered === choice.value
            return (
              <button
                key={choice.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                className={`bwc-toggle__option${isActive ? ' bwc-toggle__option--active' : ''}`}
                onClick={() => handleGstChoice(choice.value)}
              >
                {choice.label}
              </button>
            )
          })}
        </div>
      </div>

      {data.gstRegistered === 'yes' && (
        <FormTextField
          id="bwc-gstin"
          label="GSTIN"
          placeholder="15-character GSTIN (e.g. 29ABCDE1234F1Z5)"
          maxLength={L.gstin}
          value={data.gstin}
          onChange={setText('gstin')}
          hint={COPY.gstinHint}
          error={errors.gstin}
        />
      )}
      <FormTextField
        id="bwc-udyam"
        label="Udyam / MSME Registration"
        placeholder="UDYAM-XX-00-0000000"
        required={false}
        maxLength={L.udyam}
        value={data.udyamNumber}
        onChange={setText('udyamNumber')}
        hint={COPY.udyamHint}
        error={errors.udyamNumber}
      />
    </section>
  )
}

export default BusinessProfileCard
