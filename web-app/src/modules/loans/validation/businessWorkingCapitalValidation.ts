import { getStatesForPincode, validatePincodeMatchesState } from '@shared/utils'
import { stateFromGstin } from '@modules/gst/utils/gstBusinessDetails.constants'
import { BUSINESS_PROFILE_LIMITS } from '@modules/loans/components/BusinessWorkingCapital/steps/BusinessProfile/businessProfile.constants'
import type { BusinessWorkingCapitalFormData, KycStepData, LoanAddress } from '@modules/loans/types/businessWorkingCapital.types'
import { getBwcDocumentList } from '@modules/loans/components/BusinessWorkingCapital/steps/Documents/documents.constants'
import { LOAN_PATTERNS, loanFieldRules, toStepResult } from './commonLoanValidation'
import type { LoanStepValidationResult } from './commonLoanValidation'

const REQUIRED_FIELDS_MESSAGE = 'Please complete all required fields marked with *.'

const EARLIEST_ESTABLISHMENT = '1900-01-01'

/**
 * Keyboard-mash detection for free text: the same character 5+ times in a row,
 * or a long word with no vowels (e.g. "Gdhdhbcncncn", "Cgkjccggg").
 */
export const looksLikeJunk = (value: string): boolean => {
  const v = value.trim()
  if (/(.)\1{4,}/i.test(v)) return true
  return (v.match(/[A-Za-z]+/g) ?? []).some((word) => word.length >= 6 && !/[aeiouy]/i.test(word))
}

export const wordCount = (value: string) => value.trim().split(/[\s,]+/).filter(Boolean).length

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

const validateAddress = (address: LoanAddress, prefix: string): Record<string, string> => {
  const key = (field: keyof LoanAddress) => addressErrorKey(prefix, field)
  const stateError = address.state ? undefined : 'Please select a state / UT'
  const pincodeError = loanFieldRules.pincode(address.pincode)
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
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => Boolean(message))) as Record<string, string>
}

/** Step 1: KYC Verification (addresses + consent; identity is read-only) */
export function validateStep1KycVerification(data: KycStepData): LoanStepValidationResult {
  const permanentErrors =
    data.permanentSameAsCurrent === 'no' ? validateAddress(data.permanentAddress, 'permanentAddress') : {}

  const errors: Record<string, string> = {
    ...validateAddress(data.currentAddress, 'currentAddress'),
    ...(data.permanentSameAsCurrent ? {} : { permanentSameAsCurrent: 'Please confirm your permanent address.' }),
    ...permanentErrors,
    ...(data.kycConsent ? {} : { kycConsent: 'Please accept the consent to verify your KYC details.' }),
  }
  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

const L = BUSINESS_PROFILE_LIMITS

const validateBusinessName = (value: string): string | undefined => {
  const v = value.trim()
  if (!v) return 'Business / trade name is required'
  if (v.length < 3) return 'Business / trade name must be at least 3 characters'
  if (!/[A-Za-z]{2}/.test(v)) return 'Business / trade name must contain letters'
  return looksLikeJunk(v) ? 'Please enter a valid business / trade name' : undefined
}

const validateGstin = (value: string, businessPincode: string): string | undefined => {
  const v = value.trim().toUpperCase()
  if (!v) return 'GSTIN is required for GST registered entities'
  if (!LOAN_PATTERNS.GSTIN.test(v)) return 'Enter a valid 15-character GSTIN'
  const pinError = loanFieldRules.pincode(businessPincode)
  const stateOk = pinError || getStatesForPincode(businessPincode).includes(stateFromGstin(v))
  return stateOk ? undefined : 'GSTIN state code does not match the business PIN code'
}

const validatePurposeDescription = (value: string): string | undefined => {
  const v = value.trim()
  if (!v) return 'Please describe how the financing will be used'
  if (v.length < L.purposeDescriptionMin) return `Description must be at least ${L.purposeDescriptionMin} characters`
  if (v.length > L.purposeDescriptionMax) return `Description cannot exceed ${L.purposeDescriptionMax} characters`
  if ((v.match(/[A-Za-z]/g)?.length ?? 0) < 10 || wordCount(v) < 3) return 'Please describe the purpose in a few words'
  return looksLikeJunk(v) ? 'Please enter a meaningful description of the purpose' : undefined
}

/** Optional Udyam number: format UDYAM-XX-00-0000000 or UDYAM-00-XX-00000000 */
const validateUdyam = (value: string): string | undefined => {
  const v = value.trim().toUpperCase()
  if (!v) return undefined
  const match = /^UDYAM-([A-Z0-9]{2})-([A-Z0-9]{2})-([A-Z0-9]{6,8})$/.exec(v)
  if (!match) return 'Enter Udyam number as UDYAM-XX-00-0000000'
  return undefined
}

const validateEstablishmentDate = (value: string): string | undefined =>
  loanFieldRules.pastDate(value, 'Business establishment date') ||
  loanFieldRules.dateOrder(EARLIEST_ESTABLISHMENT, value, 'Enter a valid business establishment date')

/** Step 2: Business Profile and loan / credit-limit requirements */
export function validateStep2BusinessProfile(data: BusinessWorkingCapitalFormData): LoanStepValidationResult {
  const checks: Record<string, string | undefined> = {
    financingFacility: data.financingFacility ? undefined : 'Please select a financing facility',
    businessName: validateBusinessName(data.businessName),
    businessConstitution: data.businessConstitution ? undefined : 'Please select the business constitution',
    businessActivity: data.businessActivity ? undefined : 'Please select the primary business activity',
    establishmentDate: validateEstablishmentDate(data.establishmentDate),
    operatingAddress: validateFreeText(data.operatingAddress, 'Business operating address', {
      min: 10,
      max: L.operatingAddress,
      minWords: 2,
    }),
    businessPincode: loanFieldRules.pincode(data.businessPincode),
    gstRegistered: data.gstRegistered ? undefined : 'Please select whether the business is GST registered',
    gstin: data.gstRegistered === 'yes' ? validateGstin(data.gstin, data.businessPincode) : undefined,
    udyamNumber: validateUdyam(data.udyamNumber),
    loanAmount: loanFieldRules.amount(data.loanAmount, 'Amount', L.minLoanAmount, L.maxLoanAmount),
    loanPurpose: data.loanPurpose ? undefined : 'Please select the purpose of the loan',
    purposeDescription: validatePurposeDescription(data.purposeDescription),
    avgMonthlySales: loanFieldRules.amount(data.avgMonthlySales, 'Avg monthly sales', L.minMonthlyMetric, L.maxMonthlyMetric),
    avgMonthlyExpenses: loanFieldRules.amount(data.avgMonthlyExpenses, 'Avg monthly expenses', L.minMonthlyMetric, L.maxMonthlyMetric),
  }
  const errors = Object.fromEntries(Object.entries(checks).filter(([, m]) => Boolean(m))) as Record<string, string>
  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Step 3: Documents verification */
export function validateStep3Documents(data: BusinessWorkingCapitalFormData): LoanStepValidationResult {
  const isGst = data.gstRegistered === 'yes'
  const docs = getBwcDocumentList(data.financingFacility, isGst)
  const uploaded = data.uploadedDocs || {}

  const missingDocs = docs.filter((doc) => doc.isRequired && !uploaded[doc.id])
  const errors: Record<string, string> = Object.fromEntries(
    missingDocs.map((doc) => [doc.id, `Please upload ${doc.title}`]),
  )

  const pendingCount = missingDocs.length
  return toStepResult(
    errors,
    pendingCount > 0
      ? `Upload the ${pendingCount} pending required document${pendingCount > 1 ? 's' : ''} to continue.`
      : undefined,
  )
}

const STEP_NAMES = ['KYC Verification', 'Business Details', 'Documents']

/**
 * Step 4: Review & Submit. Re-checks steps 1–3 as well, since a restored draft or an
 * edit made from the review can leave an earlier step incomplete.
 */
export function validateStep4Review(data: BusinessWorkingCapitalFormData): LoanStepValidationResult {
  const earlier = [validateStep1KycVerification, validateStep2BusinessProfile, validateStep3Documents]
  const failedIndex = earlier.findIndex((validate) => !validate(data).isValid)
  if (failedIndex >= 0) {
    return toStepResult(
      { [`step${failedIndex + 1}`]: 'incomplete' },
      `Some details in ${STEP_NAMES[failedIndex]} need attention. Use Edit to update them before submitting.`,
    )
  }
  const errors: Record<string, string> = data.termsAccepted
    ? {}
    : { termsAccepted: 'Please accept the declaration before submitting your application.' }
  return toStepResult(errors, 'Please accept the declaration before submitting.')
}

export const businessWorkingCapitalValidation = {
  validateStep1: validateStep1KycVerification,
  validateStep2: validateStep2BusinessProfile,
  validateStep3: validateStep3Documents,
  validateStep4: validateStep4Review,
}

