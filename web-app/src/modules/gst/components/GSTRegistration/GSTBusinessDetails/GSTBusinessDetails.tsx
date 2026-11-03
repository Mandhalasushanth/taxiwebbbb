import React from 'react'
import type { GstBusinessFormData } from '../GSTStepBusiness/GSTStepBusiness'
import { GSTBusinessIdentitySection, GSTRegistrationSchemeSection } from './GSTBusinessGeneralSection'
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
  onBlur?: (field: keyof GstBusinessFormData) => void
  errors?: Record<string, string>
  onClearError?: (field: string) => void
}

/** Business Identity, Registration & Scheme and Principal Place of Business cards */
export const GSTBusinessDetails: React.FC<GSTBusinessDetailsProps> = (props) => (
  <div id="gst-business-details" className="gst-business-details-stack">
    <GSTBusinessIdentitySection {...props} />
    <GSTRegistrationSchemeSection {...props} />
    <GSTBusinessAddressSection {...props} />
  </div>
)
