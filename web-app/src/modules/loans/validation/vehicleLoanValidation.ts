import { validatePincodeMatchesState } from '@shared/utils'
import type { VehicleLoanData } from '@modules/loans/types/vehicleLoan.types'
import type { KycStepData, LoanAddress } from '@modules/loans/types'
import { loanFieldRules, toStepResult } from './commonLoanValidation'
import type { LoanStepValidationResult } from './commonLoanValidation'

const REQUIRED_FIELDS_MESSAGE = 'Please complete all required fields marked with *.'

/**
 * Keyboard-mash detection for free text: the same character 5+ times in a row,
 * or a long word with no vowels (e.g. "Gdhdhbcncncn", "Cgkjccggg").
 */
export const looksLikeJunk = (value: string): boolean => {
  const v = value.trim()
  if (/(.)\1{4,}/i.test(v)) return true
  return (v.match(/[A-Za-z]+/g) ?? []).some((word) => word.length >= 6 && !/[aeiouy]/i.test(word))
}

export const wordCount = (value: string): number =>
  value.trim().split(/[\s,]+/).filter(Boolean).length

/** Free-text rule: length bounds, must contain letters, minimum word count and no keyboard mash */
export const validateFreeText = (
  value: string,
  label: string,
  { min, max, minWords }: { min: number; max: number; minWords: number },
): string | undefined => {
  const base = loanFieldRules.text(value, label, min, max)
  if (base) return base
  if (!/[A-Za-z]/.test(value)) return `${label} must contain letters`
  if (wordCount(value) < minWords) return `Please enter a complete ${label.toLowerCase()}`
  return looksLikeJunk(value) ? `Please enter a valid ${label.toLowerCase()}` : undefined
}

/** Error keys are "<prefix>.<field>", e.g. "currentAddress.pincode" */
export const addressErrorKey = (prefix: string, field: keyof LoanAddress): string => `${prefix}.${field}`

export const validateAddress = (address: LoanAddress, prefix: string): Record<string, string> => {
  const key = (field: keyof LoanAddress) => addressErrorKey(prefix, field)
  const stateError = address.state ? undefined : 'Please select a state / UT'

  let pincodeError = loanFieldRules.pincode(address.pincode)
  if (!pincodeError && /^(\d)\1{5}$/.test(address.pincode)) {
    pincodeError = 'Please enter a valid 6-digit PIN code'
  }

  const mismatchError =
    !stateError && !pincodeError ? validatePincodeMatchesState(address.pincode, address.state) || undefined : undefined

  const checks: Record<string, string | undefined> = {
    [key('houseBuilding')]:
      loanFieldRules.text(address.houseBuilding, 'House / Flat / Building', 2, 120) ||
      (looksLikeJunk(address.houseBuilding) ? 'Please enter a valid house / flat / building' : undefined),
    [key('streetLocality')]: validateFreeText(address.streetLocality, 'Street / Locality', { min: 3, max: 150, minWords: 1 }),
    [key('city')]:
      loanFieldRules.placeName(address.city, 'City / District') ||
      (looksLikeJunk(address.city) ? 'Please enter a valid city / district' : undefined),
    [key('pincode')]: pincodeError || mismatchError,
    [key('state')]: stateError,
  }

  return Object.fromEntries(
    Object.entries(checks).filter(([, message]) => Boolean(message)),
  ) as Record<string, string>
}

/** Step 1: KYC Verification (addresses + consent; identity is read-only) */
export function validateStep1KycVerification(data: Partial<KycStepData>): LoanStepValidationResult {
  const current = data.currentAddress || { houseBuilding: '', streetLocality: '', city: '', pincode: '', state: '' }
  const permanent = data.permanentAddress || { houseBuilding: '', streetLocality: '', city: '', pincode: '', state: '' }
  const permanentErrors =
    data.permanentSameAsCurrent === 'no' ? validateAddress(permanent, 'permanentAddress') : {}

  const errors: Record<string, string> = {
    ...validateAddress(current, 'currentAddress'),
    ...(data.permanentSameAsCurrent ? {} : { permanentSameAsCurrent: 'Please confirm your permanent address.' }),
    ...permanentErrors,
    ...(data.kycConsent ? {} : { kycConsent: 'Please accept the consent to verify your KYC details.' }),
  }
  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/**
 * Step 2: Vehicle & Loan Details (matching screenshots)
 * Validates:
 * 1. Requested Loan Amount (required, min 10000, max 50000000)
 * 2. Vehicle Condition (required: New Vehicle or Used Vehicle)
 * 3. Vehicle Category (required: Car, Two-Wheeler, Commercial Vehicle, Other)
 * 4. Vehicle Make / Brand (required text, min 2 chars, valid text)
 * 5. Vehicle Model (required text, min 2 chars, valid text)
 * 6. Approximate Vehicle Price (required, min 10000, must be >= requested loan amount)
 * 7. Dealer Selected? (required: Yes or No)
 * 8. Purchase Timeline (required: Within 7 days, Within 30 days, 1–3 months, Just exploring)
 * 9. Registration State (required: selected state from list)
 */
export function validateStep2VehicleAndLoanDetails(data: Partial<VehicleLoanData>): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  // 1. Requested Loan Amount
  const amountStr = data.requestedLoanAmount || (data.loanAmount ? String(data.loanAmount) : '')
  const amountVal = Number(String(amountStr).replace(/\D/g, ''))
  if (!amountStr || !amountVal) {
    errors.requestedLoanAmount = 'Requested loan amount is required'
  } else if (amountVal < 10000) {
    errors.requestedLoanAmount = 'Minimum loan amount is ₹10,000'
  } else if (amountVal > 50000000) {
    errors.requestedLoanAmount = 'Maximum loan amount is ₹5,00,00,000 (5 Crores)'
  }

  // 2. Vehicle Condition
  if (!data.vehicleCondition) {
    errors.vehicleCondition = 'Please select vehicle condition'
  }

  // 3. Vehicle Category
  if (!data.vehicleCategory) {
    errors.vehicleCategory = 'Please select vehicle category'
  }

  // 4. Vehicle Make / Brand
  const makeBrand = (data.vehicleMakeBrand || data.vehicleBrand || '').trim()
  if (!makeBrand) {
    errors.vehicleMakeBrand = 'Vehicle make / brand is required'
  } else if (makeBrand.length < 2) {
    errors.vehicleMakeBrand = 'Vehicle make / brand must be at least 2 characters'
  } else if (looksLikeJunk(makeBrand)) {
    errors.vehicleMakeBrand = 'Please enter a valid vehicle make / brand'
  }

  // 5. Vehicle Model
  const model = (data.vehicleModel || data.vehicleMakeModel || '').trim()
  if (!model) {
    errors.vehicleModel = 'Vehicle model is required'
  } else if (model.length < 2) {
    errors.vehicleModel = 'Vehicle model must be at least 2 characters'
  } else if (looksLikeJunk(model)) {
    errors.vehicleModel = 'Please enter a valid vehicle model'
  }

  // 6. Approximate Vehicle Price
  const priceStr = data.approximateVehiclePrice || (data.onRoadPrice ? String(data.onRoadPrice) : '')
  const priceVal = Number(String(priceStr).replace(/\D/g, ''))
  if (!priceStr || !priceVal) {
    errors.approximateVehiclePrice = 'Approximate vehicle price is required'
  } else if (priceVal < 10000) {
    errors.approximateVehiclePrice = 'Approximate vehicle price must be at least ₹10,000'
  } else if (amountVal > priceVal) {
    errors.requestedLoanAmount = 'Requested loan amount cannot exceed approximate vehicle price'
  }

  // 7. Dealer Selected?
  if (!data.dealerSelected) {
    errors.dealerSelected = 'Please specify if dealer is selected'
  } else if (data.dealerSelected === 'Yes') {
    const dealerName = (data.dealerName || '').trim()
    if (!dealerName) {
      errors.dealerName = 'Dealer name is required'
    } else if (dealerName.length < 2) {
      errors.dealerName = 'Dealer name must be at least 2 characters'
    }
  }

  // 8. Purchase Timeline
  if (!data.purchaseTimeline) {
    errors.purchaseTimeline = 'Please select purchase timeline'
  }

  // 9. Registration State
  if (!data.registrationState) {
    errors.registrationState = 'Please select registration state'
  }

  // Backward compatibility mirrors
  if (errors.requestedLoanAmount) errors.loanAmount = errors.requestedLoanAmount
  if (errors.approximateVehiclePrice) errors.onRoadPrice = errors.approximateVehiclePrice
  if (errors.vehicleMakeBrand) errors.vehicleBrand = errors.vehicleMakeBrand
  if (errors.vehicleModel) errors.vehicleMakeModel = errors.vehicleModel

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

import { getVehicleLoanDocumentSections } from '../components/VehicleLoan/vehicleLoan.constants'

/**
 * Step 3: Documents
 * Validates required documents dynamically based on vehicleCondition:
 * - If Used Vehicle: "RC Copy" (rc_copy) is required
 * - If New Vehicle: "Vehicle Quotation / Proforma Invoice" (vehicle_quotation) is required
 * (Booking Receipt is optional)
 */
export function validateStep3Documents(data: Partial<VehicleLoanData>): LoanStepValidationResult {
  const errors: Record<string, string> = {}
  const uploaded = data.uploadedDocs || {}
  const { requiredDocs } = getVehicleLoanDocumentSections(data.vehicleCondition)

  for (const doc of requiredDocs) {
    const hasDoc = Boolean(
      uploaded[doc.id] ||
      (doc.id === 'rc_copy' && (uploaded.vehicle_rc || uploaded.rc_book)) ||
      (doc.id === 'vehicle_quotation' && (uploaded.proforma_invoice || uploaded.dealer_quotation))
    )
    if (!hasDoc) {
      errors[doc.id] = `${doc.title} is required`
    }
  }

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Step 4: Review & Declaration */
export function validateStep4ReviewAndDeclaration(data: Partial<VehicleLoanData>): LoanStepValidationResult {
  const errors: Record<string, string> = {}
  if (!data.termsAccepted) {
    errors.termsAccepted = 'Please accept the declaration to submit your application.'
  }
  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

export const validateStep4 = validateStep4ReviewAndDeclaration

export const vehicleLoanValidation = {
  validateStep1(data: Partial<VehicleLoanData>): LoanStepValidationResult {
    return validateStep1KycVerification(data as Partial<KycStepData>)
  },

  validateStep2(data: Partial<VehicleLoanData>): LoanStepValidationResult {
    return validateStep2VehicleAndLoanDetails(data)
  },

  validateVehicleRequirements(data: Partial<VehicleLoanData>): LoanStepValidationResult {
    return validateStep2VehicleAndLoanDetails(data)
  },

  validateStep3(data: Partial<VehicleLoanData>): LoanStepValidationResult {
    return validateStep3Documents(data)
  },

  validateStep4(data: Partial<VehicleLoanData>): LoanStepValidationResult {
    return validateStep4ReviewAndDeclaration(data)
  },

  validateStep5(_data: Partial<VehicleLoanData>): LoanStepValidationResult {
    return toStepResult({})
  },
}


