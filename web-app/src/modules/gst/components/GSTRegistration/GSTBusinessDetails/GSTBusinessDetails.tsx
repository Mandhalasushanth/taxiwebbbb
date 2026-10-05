import React from 'react'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
import { GSTBusinessGeneralSection } from './GSTBusinessGeneralSection'
import { GSTBusinessAddressSection } from './GSTBusinessAddressSection'


export interface GSTBusinessDetailsProps {
  data: Pick<
    GstBusinessFormData,
    | 'legalName'
    | 'tradeName'
    | 'constitution'
    | 'businessPan'
    | 'natureOfBusiness'
    | 'commencementDate'
    | 'registrationReason'
    | 'compositionScheme'
    | 'placeOfBusiness'
    | 'businessAddress'
    | 'city'
    | 'district'
    | 'state'
    | 'pinCode'
    | 'hsnSacCode'
  >
  onChange: <K extends keyof GstBusinessFormData>(field: K, value: GstBusinessFormData[K]) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

export const GSTBusinessDetails: React.FC<GSTBusinessDetailsProps> = ({
  data,
  onChange,
  errors = {},
  onClearError,
}) => {
  return (
    <div className="gst-form-card">
      <div className="gst-form-card__header">
        <div className="gst-form-card__icon-badge gst-form-card__icon-badge--blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <h2 className="gst-form-card__title">Business Details</h2>
      </div>

      <div className="gst-form-card__body">
        <GSTBusinessGeneralSection
          data={data}
          onChange={onChange}
          errors={errors}
          onClearError={onClearError}
        />
        <GSTBusinessAddressSection
          data={data}
          onChange={onChange}
          errors={errors}
          onClearError={onClearError}
        />
      </div>
    </div>
  )
}
