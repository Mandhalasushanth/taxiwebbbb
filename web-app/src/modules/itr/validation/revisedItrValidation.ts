import type {
  RevisionReasonKey,
  IncomeCorrectionState,
  DeductionCorrectionState,
  BankCorrectionState,
  DocumentTypeId,
  UploadedDocument,
  RevisedItrValidationErrors,
} from '../types/revisedItr.types'

export const validateAckNumber = (val: string): string | null => {
  const trimmed = val.trim()
  if (!trimmed) {
    return 'Original ITR Acknowledgement Number is required.'
  }
  if (!/^\d{15}$/.test(trimmed)) {
    return `Acknowledgement number must be exactly 15 digits (${trimmed.length}/15 entered).`
  }
  return null
}

export const validateAssessmentYear = (val: string): string | null => {
  if (!val || !val.trim()) {
    return 'Please select an Assessment Year.'
  }
  return null
}

export const sanitizeAckNumberInput = (val: string): string => val.replace(/\D/g, '').slice(0, 15)

export const sanitizeNumericAmount = (val: string): string => val.replace(/\D/g, '')

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ALLOWED_CONTROL_KEYS = [
  'Backspace',
  'Tab',
  'Enter',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]

export const isNumericKeyAllowed = (key: string, isCtrlOrMeta: boolean): boolean =>
  ALLOWED_CONTROL_KEYS.includes(key) || isCtrlOrMeta || /^\d$/.test(key)

export const validateRevisionReason = (
  reason: RevisionReasonKey | null,
  otherText: string
): { reasonError?: string | null; otherReasonError?: string | null } => {
  if (!reason) {
    return { reasonError: 'Please select a reason for revising your ITR.', otherReasonError: null }
  }
  if (reason === 'other' && !otherText.trim()) {
    return { reasonError: null, otherReasonError: 'Please specify your reason for revision.' }
  }
  return { reasonError: null, otherReasonError: null }
}

export const validateIncomeCorrections = (
  values: IncomeCorrectionState
): { salaryIncomeError?: string | null; taxableIncomeError?: string | null } => ({
  salaryIncomeError: !values.salaryIncome?.trim() ? 'Salary / Business income is required.' : null,
  taxableIncomeError: !values.taxableIncome?.trim() ? 'Taxable income is required.' : null,
})

export const validateDeductionCorrections = (
  values: DeductionCorrectionState
): { taxableIncomeError?: string | null } => ({
  taxableIncomeError: !values.taxableIncome?.trim() ? 'Taxable income is required.' : null,
})

export const validateBankCorrections = (
  values: BankCorrectionState
): { bankAccountError?: string | null; ifscError?: string | null } => {
  const bankAccountError = !values.accountNumber?.trim()
    ? 'Bank account number is required.'
    : !/^\d{9,18}$/.test(values.accountNumber.trim())
      ? 'Please enter a valid bank account number.'
      : null
  const trimmedIfsc = values.ifsc?.trim() || ''
  const ifscError = !trimmedIfsc
    ? 'IFSC is required.'
    : !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(trimmedIfsc.toUpperCase())
      ? 'Please enter a valid 11-character IFSC code.'
      : null

  return { bankAccountError, ifscError }
}

export const calculateIncomeChange = (
  original: number,
  revisedStr: string
): { changeText: string; tone: 'positive' | 'negative' | 'neutral' } => {
  if (!revisedStr || !revisedStr.trim()) {
    return { changeText: '—', tone: 'neutral' }
  }
  const revisedNum = Number(revisedStr)
  if (Number.isNaN(revisedNum)) {
    return { changeText: '—', tone: 'neutral' }
  }
  const diff = revisedNum - original
  if (diff === 0) {
    return { changeText: '₹ 0', tone: 'neutral' }
  }
  const formattedAbs = new Intl.NumberFormat('en-IN').format(Math.abs(diff))
  return diff > 0
    ? { changeText: `+₹ ${formattedAbs}`, tone: 'positive' }
    : { changeText: `-₹ ${formattedAbs}`, tone: 'negative' }
}

const REQUIRED_DOCS_MAP: Record<RevisionReasonKey, Array<{ id: DocumentTypeId; label: string }>> = {
  wrong_deduction: [
    { id: 'pan', label: 'PAN Card' },
    { id: 'aadhaar', label: 'Aadhaar Card' },
    { id: 'investment_proof', label: 'Investment Proofs' },
  ],
  incorrect_bank: [
    { id: 'pan', label: 'PAN Card' },
    { id: 'aadhaar', label: 'Aadhaar Card' },
    { id: 'bank_statement', label: 'Bank Statements' },
  ],
  other: [
    { id: 'pan', label: 'PAN Card' },
    { id: 'aadhaar', label: 'Aadhaar Card' },
  ],
  missed_income: [
    { id: 'pan', label: 'PAN Card' },
    { id: 'aadhaar', label: 'Aadhaar Card' },
    { id: 'form16', label: 'Form 16 / Form 16A' },
    { id: 'ais_tis', label: 'AIS and TIS Statement' },
  ],
}

export const validateRequiredDocuments = (
  uploads: Partial<Record<DocumentTypeId, UploadedDocument>>,
  selectedReason?: RevisionReasonKey | null
): string | null => {
  const requiredIds = REQUIRED_DOCS_MAP[selectedReason || 'missed_income'] || REQUIRED_DOCS_MAP.missed_income
  const missing = requiredIds.filter(({ id }) => !uploads[id])
  return missing.length > 0
    ? `Please upload all required documents: ${missing.map((m) => m.label).join(', ')}.`
    : null
}

export const validateRevisedItrStage = (params: {
  step: 1 | 2 | 3 | 4 | 5
  ackNumber: string
  selectedAy: string
  selectedReason: RevisionReasonKey | null
  otherReasonText: string
  incomeCorrections: IncomeCorrectionState
  deductionCorrections: DeductionCorrectionState
  bankCorrections: BankCorrectionState
  uploadedDocuments: Partial<Record<DocumentTypeId, UploadedDocument>>
}): { isValid: boolean; errors: RevisedItrValidationErrors } => {
  const {
    step,
    ackNumber,
    selectedAy,
    selectedReason,
    otherReasonText,
    incomeCorrections,
    deductionCorrections,
    bankCorrections,
    uploadedDocuments,
  } = params

  if (step === 1) {
    const ackErr = validateAckNumber(ackNumber)
    const ayErr = validateAssessmentYear(selectedAy)
    return ackErr || ayErr ? { isValid: false, errors: { ackError: ackErr, ayError: ayErr } } : { isValid: true, errors: {} }
  }

  if (step === 2) {
    const validation = validateRevisionReason(selectedReason, otherReasonText)
    return validation.reasonError || validation.otherReasonError
      ? { isValid: false, errors: { reasonError: validation.reasonError, otherReasonError: validation.otherReasonError } }
      : { isValid: true, errors: {} }
  }

  if (step === 3) {
    if (selectedReason === 'wrong_deduction') {
      const { taxableIncomeError } = validateDeductionCorrections(deductionCorrections)
      return taxableIncomeError ? { isValid: false, errors: { taxableIncomeError } } : { isValid: true, errors: {} }
    }
    if (selectedReason === 'incorrect_bank') {
      const { bankAccountError, ifscError } = validateBankCorrections(bankCorrections)
      return bankAccountError || ifscError
        ? { isValid: false, errors: { bankAccountError, ifscError } }
        : { isValid: true, errors: {} }
    }
    if (selectedReason === 'other') {
      const incomeValidation = validateIncomeCorrections(incomeCorrections)
      const bankErrors =
        bankCorrections.accountNumber.trim() || bankCorrections.ifsc.trim()
          ? validateBankCorrections(bankCorrections)
          : {}
      const hasError =
        incomeValidation.salaryIncomeError ||
        incomeValidation.taxableIncomeError ||
        bankErrors.bankAccountError ||
        bankErrors.ifscError
      return hasError
        ? {
            isValid: false,
            errors: {
              salaryIncomeError: incomeValidation.salaryIncomeError,
              taxableIncomeError: incomeValidation.taxableIncomeError,
              bankAccountError: bankErrors.bankAccountError,
              ifscError: bankErrors.ifscError,
            },
          }
        : { isValid: true, errors: {} }
    }
    const { salaryIncomeError, taxableIncomeError } = validateIncomeCorrections(incomeCorrections)
    return salaryIncomeError || taxableIncomeError
      ? { isValid: false, errors: { salaryIncomeError, taxableIncomeError } }
      : { isValid: true, errors: {} }
  }

  if (step === 4) {
    const docsError = validateRequiredDocuments(uploadedDocuments, selectedReason)
    return docsError ? { isValid: false, errors: { documentsError: docsError } } : { isValid: true, errors: {} }
  }

  return { isValid: true, errors: {} }
}

export const calculateTaxLiability = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0

  const baseTax =
    taxableIncome <= 250000
      ? 0
      : taxableIncome <= 500000
        ? (taxableIncome - 250000) * 0.05
        : taxableIncome <= 1000000
          ? 12500 + (taxableIncome - 500000) * 0.2
          : 112500 + (taxableIncome - 1000000) * 0.3

  const surchargeRate =
    taxableIncome > 20000000
      ? 0.25
      : taxableIncome > 10000000
        ? 0.15
        : taxableIncome > 5000000
          ? 0.1
          : 0

  const totalWithSurcharge = baseTax * (1 + surchargeRate)
  return Math.round(totalWithSurcharge * 1.04)
}
