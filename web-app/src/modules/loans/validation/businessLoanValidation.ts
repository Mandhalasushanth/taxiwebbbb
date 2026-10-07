import type { BusinessLoanFormData } from '@modules/loans/types/businessLoan.types'
import { loanDocumentService } from '@modules/loans/documents/loanDocumentService'
import { LOAN_PATTERNS, commonLoanValidation, loanFieldRules, toAmount, toStepResult } from './commonLoanValidation'
import type { LoanStepValidationResult } from './commonLoanValidation'

/**
 * Business Loan step validators. MSME Loan uses the same form, so it reuses these
 * (see msmeLoanValidation.ts).
 */

const REQUIRED_FIELDS_MESSAGE = 'Please complete all required fields marked with *.'

const isBlank = (val: string | undefined): boolean => !val || !val.trim()

/** Step 1: Loan & Applicant */
export function validateStep1LoanAndApplicant(
  data: BusinessLoanFormData,
  loanLabel = 'business loan'
): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  if (!data.employmentProfile) {
    errors.employmentProfile = 'Please select your employment or business profile.'
  }
  if (isBlank(data.requiredLoanAmount)) {
    errors.requiredLoanAmount = 'Please select the required loan amount.'
  }
  if (isBlank(data.preferredTenureMonths)) {
    errors.preferredTenureMonths = 'Please select your preferred loan tenure.'
  }
  if (isBlank(data.purposeOfLoan)) {
    errors.purposeOfLoan = `Please select the purpose of the ${loanLabel}.`
  }
  if (isBlank(data.revenueOrTurnover)) {
    errors.revenueOrTurnover = 'Please enter your monthly or annual revenue/turnover.'
  } else if (toAmount(data.revenueOrTurnover) <= 0) {
    errors.revenueOrTurnover = 'Please enter a valid revenue amount greater than zero.'
  }
  if (!data.existingLoans) {
    errors.existingLoans = 'Please indicate whether you have any existing loans.'
  }

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Step 2: Business Details */
export function validateStep2BusinessDetails(data: BusinessLoanFormData): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  const businessName = (data.registeredBusinessName || '').trim()
  if (!businessName) {
    errors.registeredBusinessName = 'Please enter your registered business or firm name.'
  } else if (businessName.length < 3) {
    errors.registeredBusinessName = 'Business name must be at least 3 characters.'
  }

  if (isBlank(data.businessConstitution)) {
    errors.businessConstitution = 'Please select your business constitution/type.'
  }

  if (isBlank(data.gstin)) {
    errors.gstin = 'Please enter your 15-character GSTIN.'
  } else if (!commonLoanValidation.isValidGst(data.gstin)) {
    errors.gstin = 'Please enter a valid 15-character GSTIN (e.g. 27ABCDE1234F1Z5).'
  }

  if (!data.hasUdyam) {
    errors.hasUdyam = 'Please select whether your business holds an Udyam Registration.'
  } else if (data.hasUdyam === 'yes') {
    if (isBlank(data.udyamRegistrationNumber)) {
      errors.udyamRegistrationNumber = 'Please enter your Udyam Registration Number.'
    } else if (!LOAN_PATTERNS.UDYAM.test(data.udyamRegistrationNumber.trim().toUpperCase())) {
      errors.udyamRegistrationNumber = 'Please enter a valid Udyam number (e.g. UDYAM-TS-02-0012345).'
    }
  }

  if (isBlank(data.businessVintage)) {
    errors.businessVintage = 'Please select your business vintage.'
  }

  const turnover = toAmount(data.annualTurnover)
  if (isBlank(data.annualTurnover)) {
    errors.annualTurnover = 'Please enter your latest annual turnover.'
  } else if (turnover <= 0) {
    errors.annualTurnover = 'Please enter a valid turnover amount greater than zero.'
  }

  if (isBlank(data.annualNetProfit)) {
    errors.annualNetProfit = 'Please enter your annual net profit (after tax).'
  } else if (turnover > 0 && toAmount(data.annualNetProfit) > turnover) {
    errors.annualNetProfit = 'Net profit cannot be greater than annual turnover.'
  }

  const signatoryName = (data.signatoryName || '').trim()
  if (!signatoryName) {
    errors.signatoryName = 'Please enter the signatory name.'
  } else if (!LOAN_PATTERNS.PERSON_NAME.test(signatoryName)) {
    errors.signatoryName = 'Signatory name must contain only letters, no numbers allowed.'
  } else if (signatoryName.length < 2) {
    errors.signatoryName = 'Signatory name must be at least 2 characters.'
  }

  const designation = (data.signatoryDesignation || '').trim()
  if (!designation) {
    errors.signatoryDesignation = 'Please enter the signatory designation.'
  } else if (/\d/.test(designation)) {
    errors.signatoryDesignation = 'Designation must contain only letters, no numbers allowed.'
  } else if (designation.length < 2) {
    errors.signatoryDesignation = 'Designation must be at least 2 characters.'
  }

  const email = (data.signatoryEmail || '').trim()
  if (email && !LOAN_PATTERNS.EMAIL.test(email)) {
    errors.signatoryEmail = 'Please enter a valid email address.'
  }

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/** Step 3: Banking & Tax Records */
export function validateStep3Banking(data: BusinessLoanFormData): LoanStepValidationResult {
  const errors: Record<string, string> = {}

  if (isBlank(data.primaryOperatingBankName)) {
    errors.primaryOperatingBankName = 'Please select your primary operating bank.'
  } else if (loanFieldRules.bankName(data.primaryOperatingBankName)) {
    errors.primaryOperatingBankName = 'Please enter a valid bank name (letters only).'
  }

  const account = (data.currentAccountNumber || '').trim()
  if (!account) {
    errors.currentAccountNumber = 'Please enter your current account number.'
  } else if (!commonLoanValidation.isValidAccountNumber(account)) {
    errors.currentAccountNumber = 'Please enter a valid current account number (9–18 digits).'
  }

  if (isBlank(data.bankIfscCode)) {
    errors.bankIfscCode = 'Please enter your bank IFSC code.'
  } else if (!commonLoanValidation.isValidIfsc(data.bankIfscCode)) {
    errors.bankIfscCode = 'Please enter a valid 11-character IFSC code (e.g. HDFC0001234).'
  }

  // Optional fields: only checked when filled in
  const ackError = loanFieldRules.optionalItrAck(data.itrAcknowledgementNumber)
  if (ackError) {
    errors.itrAcknowledgementNumber = 'Please enter a valid 15-digit ITR acknowledgement number.'
  }

  return toStepResult(errors, REQUIRED_FIELDS_MESSAGE)
}

/**
 * Validates an uploaded document against the application-wide upload rule (PDF, Excel, JPG or PNG up to 10 MB)
 */
export function validateDocumentFile(file: File): { isValid: boolean; error?: string } {
  const error = loanDocumentService.validateFile(file)
  return { isValid: !error, error }
}

const BUSINESS_REQUIRED_DOCS: { id: string; message: string }[] = [
  { id: 'panCard', message: 'Please upload Entity PAN card & Promoter/Director PAN card.' },
  { id: 'aadhaarCard', message: 'Please upload Aadhaar of all Primary Directors / Partners.' },
  { id: 'directorsKyc', message: 'Please upload KYC of Directors / Partners.' },
  { id: 'businessAddressProof', message: 'Please upload Business Address Proof.' },
  { id: 'bankStatements', message: 'Please upload Last 12 months bank statements.' },
  { id: 'gstCertificate', message: 'Please upload GST Certificate (REG-06).' },
  { id: 'gstReturns', message: 'Please upload Filed GSTR-3B & GSTR-1 returns for last 12 months.' },
  { id: 'businessItr', message: 'Please upload Business ITR (Last 2–3 Years).' },
  { id: 'auditedBalanceSheet', message: 'Please upload CA audited balance sheet for last 2–3 years.' },
  { id: 'profitAndLossStatement', message: 'Please upload CA certified P&L statement with schedules.' },
  { id: 'cashFlowStatement', message: 'Please upload Cash flow statement for the latest financial year.' },
  { id: 'businessExpansionDoc', message: 'Please upload Project report / Business plan / Estimated cost.' },
  { id: 'businessRegistrationProof', message: 'Please upload Certificate of Incorporation / Business license.' },
]

/** Step 4: Document Verification */
export function validateStep4Documents(data: BusinessLoanFormData): LoanStepValidationResult {
  const uploaded = (data.uploadedDocs || {}) as Record<string, unknown>
  const errors = Object.fromEntries(
    BUSINESS_REQUIRED_DOCS.filter((doc) => !uploaded[doc.id]).map((doc) => [doc.id, doc.message])
  )
  return toStepResult(errors, 'Please upload all mandatory documents marked with * before continuing.')
}

/** Step 5: Review & Submit */
export function validateStep5Review(data: BusinessLoanFormData): LoanStepValidationResult {
  const errors: Record<string, string> = {}
  if (!data.termsAccepted) {
    errors.termsAccepted = 'Please authorize TaxEdge and its lending partners to proceed with the application.'
  }
  return toStepResult(errors, 'Please check the authorization box before submitting.')
}

export const businessLoanValidation = {
  validateStep1: (data: BusinessLoanFormData) => validateStep1LoanAndApplicant(data),
  validateStep2: validateStep2BusinessDetails,
  validateStep3: validateStep3Banking,
  validateStep4: validateStep4Documents,
  validateStep5: validateStep5Review,
}
