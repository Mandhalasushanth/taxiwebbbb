import React from 'react'
import { MapPin } from 'lucide-react'
import { FieldInfoTooltip } from '@shared/components'
import { HSN_SAC_LENGTHS, getHsnSacClassification, validatePincodeMatchesState } from '@shared/utils'
import { gstInput } from '@modules/gst/utils/gstInputFormatters'
import { GSTFormSection } from '@modules/gst/shared/GSTFormSection'
import { GSTSelectField, GSTTextField } from '@modules/gst/shared/GSTFormFields'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
import {
  INDIAN_STATES_AND_UTS,
  PLACE_OF_BUSINESS_OPTIONS,
} from '@modules/gst/utils/gstBusinessDetails.constants'

type AddressField = 'placeOfBusiness' | 'businessAddress' | 'city' | 'district' | 'state' | 'pinCode' | 'hsnSacCode'

export interface GSTBusinessAddressSectionProps {
  data: Pick<GstBusinessFormData, AddressField>
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  onBlur?: (field: keyof GstBusinessFormData) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

const ADDRESS_FIELDS: readonly AddressField[] = [
  'placeOfBusiness',
  'businessAddress',
  'city',
  'district',
  'state',
  'pinCode',
  'hsnSacCode',
]

export const GSTBusinessAddressSection: React.FC<GSTBusinessAddressSectionProps> = ({
  data,
  onChange,
  onBlur,
  errors = {},
  onClearError,
}) => {
  const update = <K extends AddressField>(field: K, value: GstBusinessFormData[K]) => {
    onChange(field, value)
    onClearError?.(field)
    // A PIN / State mismatch error is re-evaluated against the new state
    if (field === 'state') onClearError?.('pinCode')
  }

  // Live PIN ↔ State check so a mismatch is visible before pressing Continue
  const pinStateMismatch = errors.pinCode ? null : validatePincodeMatchesState(data.pinCode, data.state)
  const pinCodeMessage = errors.pinCode || pinStateMismatch
  const hsnClassification = getHsnSacClassification(data.hsnSacCode)

  return (
    <GSTFormSection
      id="gst-principal-place"
      icon={<MapPin />}
      title="Principal Place of Business"
      subtitle="Registered business address & HSN details"
      fields={ADDRESS_FIELDS}
      errors={errors}
    >
      <div className="gst-form-row gst-form-row--split">
        <GSTSelectField
          id="placeOfBusiness"
          label="Place of Business"
          placeholder="Select place type"
          options={PLACE_OF_BUSINESS_OPTIONS}
          value={data.placeOfBusiness}
          error={errors.placeOfBusiness}
          onValueChange={(v) => update('placeOfBusiness', v)}
          onBlur={() => onBlur?.('placeOfBusiness')}
        />
        <GSTTextField
          id="businessAddress"
          label="Business Address"
          placeholder="Building, street, locality"
          value={data.businessAddress}
          error={errors.businessAddress}
          onValueChange={(v) => update('businessAddress', gstInput.address(v))}
          onBlur={() => {
            onChange('businessAddress', data.businessAddress.trim())
            onBlur?.('businessAddress')
          }}
        />
      </div>

      <div className="gst-form-row gst-form-row--pair">
        <GSTTextField
          id="city"
          label="City"
          placeholder="City"
          value={data.city}
          error={errors.city}
          onValueChange={(v) => update('city', gstInput.cityDistrict(v, 50))}
          onBlur={() => {
            onChange('city', data.city.trim())
            onBlur?.('city')
          }}
        />
        <GSTTextField
          id="district"
          label="District"
          placeholder="District"
          value={data.district}
          error={errors.district}
          onValueChange={(v) => update('district', gstInput.cityDistrict(v, 50))}
          onBlur={() => {
            onChange('district', data.district.trim())
            onBlur?.('district')
          }}
        />
      </div>

      <div className="gst-form-row gst-form-row--pair">
        <GSTSelectField
          id="state"
          label="State / UT"
          placeholder="Select"
          options={INDIAN_STATES_AND_UTS}
          value={data.state}
          error={errors.state}
          onValueChange={(v) => update('state', v)}
          onBlur={() => onBlur?.('state')}
        />
        <GSTTextField
          id="pinCode"
          label="PIN Code"
          placeholder="560001"
          inputMode="numeric"
          maxLength={6}
          value={data.pinCode}
          error={pinCodeMessage}
          alertError
          onValueChange={(v) => update('pinCode', gstInput.pinCode(v))}
          onBlur={() => onBlur?.('pinCode')}
        />
      </div>

      <GSTTextField
        id="hsnSacCode"
        label="Primary HSN / SAC Code"
        infoTooltip={
          <FieldInfoTooltip
            title="SAC Code Information"
            description="Enter the appropriate Service Accounting Code (SAC) applicable to the services provided by your business. Ensure the code matches the nature of your services."
          />
        }
        placeholder="e.g. 998311"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={Math.max(...HSN_SAC_LENGTHS)}
        value={data.hsnSacCode}
        error={errors.hsnSacCode}
        helper={
          !errors.hsnSacCode && hsnClassification ? (
            <div className="gst-hsn-badge" data-testid="gst-hsn-badge">
              <span className="gst-hsn-badge__check" aria-hidden="true">✓</span>{' '}
              <span>{hsnClassification.badgeText.replace(/^✓\s*/, '')}</span>
            </div>
          ) : undefined
        }
        onValueChange={(v) => update('hsnSacCode', gstInput.hsnSac(v))}
        onBlur={() => onBlur?.('hsnSacCode')}
      />
    </GSTFormSection>
  )
}
