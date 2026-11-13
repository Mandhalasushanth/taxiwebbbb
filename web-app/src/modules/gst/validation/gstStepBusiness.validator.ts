import {
  validateCommencementDate,
  validateIndividualPan,
} from '@shared/utils'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'
import { gstFieldRules as r } from '@modules/gst/validation/gstFieldRules'
import { getCompositionConflicts, validateBusinessPan } from '@modules/gst/validation/gstBusinessRules'

const select = (message: string) => (v?: string) => ((v || '').trim() ? undefined : message)

/**
 * Validates a single field of the GST Registration Step 1 form.
 * Used for field-level validation on blur and live correction.
 */
export const validateGstBusinessField = (
  field: keyof GstBusinessFormData,
  data: GstBusinessFormData
): string | undefined => {
  switch (field) {
    // 1. Business Identity
    case 'legalName':
      return r.legalName('Legal Name of Business (as per PAN)')(data.legalName)
    case 'tradeName':
      return r.tradeName('Trade Name')(data.tradeName)
    case 'constitution':
      return select('Please select constitution of business')(data.constitution)
    case 'businessPan':
      return validateBusinessPan(data.businessPan, data.constitution) || undefined
    case 'natureOfBusiness': {
      const empty = select('Please select nature of business')(data.natureOfBusiness)
      if (empty) return empty
      return getCompositionConflicts(data).natureOfBusiness
    }
    case 'commencementDate':
      return validateCommencementDate(data.commencementDate) || undefined

    // 2. Registration & Scheme
    case 'registrationReason': {
      const empty = select('Please select reason for registration')(data.registrationReason)
      if (empty) return empty
      return getCompositionConflicts(data).registrationReason
    }
    case 'compositionScheme':
      return select('Please select Yes or No for composition scheme')(data.compositionScheme)

    // 3. Principal Place of Business
    case 'placeOfBusiness':
      return select('Please select place of business type')(data.placeOfBusiness)
    case 'businessAddress':
      return r.address('Business address')(data.businessAddress)
    case 'city':
      return r.cityDistrict('City')(data.city)
    case 'district':
      return r.cityDistrict('District')(data.district)
    case 'state':
      return select('Please select state')(data.state)
    case 'pinCode':
      return r.pinCode(data.pinCode, data.state)
    case 'hsnSacCode':
      return r.hsnSac(data.hsnSacCode)

    // 4. Bank Details
    case 'accountHolderName':
      return r.accountHolderName('Account holder name')(data.accountHolderName)
    case 'accountNumber':
      return r.accountNumber(data.accountNumber)
    case 'confirmAccountNumber':
      return r.confirmAccountNumber(data.accountNumber, data.confirmAccountNumber)
    case 'ifscCode':
      return r.ifsc(data.ifscCode)
    case 'bankName':
      return r.bankName(data.bankName)
    case 'branch':
      return r.branch(data.branch)
    case 'accountType':
      return select('Please select account type')(data.accountType)

    // 5. Authorised Signatory
    case 'signatoryName':
      return r.personName('Signatory Name')(data.signatoryName)
    case 'signatoryPan':
      return validateIndividualPan(data.signatoryPan || '', 'Signatory PAN') || undefined
    case 'dob':
      return r.signatoryDob(data.dob)
    case 'designation':
      return r.designation(data.designation)
    case 'signatoryMobile':
      return r.mobile(data.signatoryMobile)
    case 'signatoryEmail':
      return r.email(data.signatoryEmail)
    case 'aadhaarConsent':
      return data.aadhaarConsent ? undefined : 'Aadhaar authentication consent is mandatory to proceed'

    default:
      return undefined
  }
}

const ALL_BUSINESS_FIELDS: (keyof GstBusinessFormData)[] = [
  'legalName',
  'tradeName',
  'constitution',
  'businessPan',
  'natureOfBusiness',
  'commencementDate',
  'registrationReason',
  'compositionScheme',
  'placeOfBusiness',
  'businessAddress',
  'city',
  'district',
  'state',
  'pinCode',
  'hsnSacCode',
  'accountHolderName',
  'accountNumber',
  'confirmAccountNumber',
  'ifscCode',
  'bankName',
  'branch',
  'accountType',
  'signatoryName',
  'signatoryPan',
  'dob',
  'designation',
  'signatoryMobile',
  'signatoryEmail',
  'aadhaarConsent',
]

/** Step 1 of GST registration: business, bank and authorised signatory details */
export const validateGstBusinessForm = (data: GstBusinessFormData): Record<string, string> => {
  const errors: Record<string, string> = {}

  for (const field of ALL_BUSINESS_FIELDS) {
    const err = validateGstBusinessField(field, data)
    if (err) {
      errors[field] = err
    }
  }

  return errors
}
