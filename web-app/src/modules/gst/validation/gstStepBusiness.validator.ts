import { validateCommencementDate, validateIndividualPan, validatePincodeMatchesState } from '@shared/utils'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'
import { gstFieldRules as r, runGstRules } from '@modules/gst/validation/gstFieldRules'
import { getCompositionConflicts, validateBusinessPan } from '@modules/gst/validation/gstBusinessRules'

const select = (message: string) => (v?: string) => ((v || '').trim() ? undefined : message)

/** Rules that compare two fields, applied after the single-field rules */
const crossFieldErrors = (data: GstBusinessFormData, fieldErrors: Record<string, string>): Record<string, string> => {
  const pinStateError = fieldErrors.pinCode || fieldErrors.state
    ? undefined
    : validatePincodeMatchesState(data.pinCode, data.state) || undefined

  return Object.fromEntries(
    Object.entries({
      pinCode: pinStateError,
      ...getCompositionConflicts(data),
    }).filter(([field, message]) => Boolean(message) && !fieldErrors[field]),
  ) as Record<string, string>
}

/** Step 1 of GST registration: business, bank and authorised signatory details */
export const validateGstBusinessForm = (data: GstBusinessFormData): Record<string, string> => {
  const errors = runGstRules(data as unknown as Record<string, unknown>, {
    // Business details
    legalName: r.businessName('Legal name of business'),
    tradeName: r.businessName('Trade / brand name'),
    constitution: select('Please select constitution of business'),
    businessPan: (v) => validateBusinessPan(v, data.constitution),
    natureOfBusiness: select('Please select nature of business'),
    commencementDate: (v) => validateCommencementDate(v || '') || undefined,
    registrationReason: select('Please select reason for registration'),
    compositionScheme: select('Please select Yes or No for composition scheme'),
    placeOfBusiness: select('Please select place of business type'),
    businessAddress: r.address('Business address'),
    city: r.placeName('City'),
    district: r.placeName('District'),
    state: select('Please select state'),
    pinCode: r.pinCode,
    hsnSacCode: r.hsnSac,

    // Bank details
    bankName: r.bankName,
    branch: r.placeName('Branch'),
    accountHolderName: r.personName('Account holder name'),
    accountNumber: r.accountNumber,
    confirmAccountNumber: (v) => r.confirmAccountNumber(data.accountNumber, v),
    accountType: select('Please select account type'),
    ifscCode: r.ifsc,

    // Authorised signatory (a person, so their PAN must be an individual PAN)
    signatoryName: r.personName('Full legal name'),
    designation: r.designation,
    signatoryPan: (v) => validateIndividualPan(v || '', 'Signatory PAN') || undefined,
    signatoryEmail: r.email,
    signatoryMobile: r.mobile,
    dob: r.signatoryDob,
  })

  const allErrors = { ...errors, ...crossFieldErrors(data, errors) }
  return data.aadhaarConsent
    ? allErrors
    : { ...allErrors, aadhaarConsent: 'Aadhaar authentication consent is mandatory to proceed' }
}
