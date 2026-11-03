import { VALIDATION_MESSAGES } from './validationMessages'

export const PAN_CATEGORIES = {
  A: 'Association of Persons',
  B: 'Body of Individuals',
  C: 'Company',
  F: 'Firm / LLP',
  G: 'Government',
  H: 'HUF',
  J: 'Artificial Juridical Person',
  L: 'Local Authority',
  P: 'Individual',
  T: 'Trust',
} as const

export type PanCategoryCode = keyof typeof PAN_CATEGORIES

/** Normalizes business entity types to their expected PAN category character */
export const BUSINESS_TYPE_PAN_CATEGORY_MAP: Record<string, PanCategoryCode> = {
  // Company (C)
  'private_limited': 'C',
  'private limited': 'C',
  'private limited company': 'C',
  'pvt_ltd': 'C',
  'pvt ltd': 'C',
  'public_limited': 'C',
  'public limited': 'C',
  'public limited company': 'C',
  'company': 'C',
  'one_person_company': 'C',
  'opc': 'C',
  'section_8': 'C',

  // Firm / LLP (F)
  'llp': 'F',
  'limited liability partnership': 'F',
  'limited_liability_partnership': 'F',
  'partnership': 'F',
  'partnership_firm': 'F',
  'partnership firm': 'F',
  'firm': 'F',

  // Individual / Proprietorship (P)
  'proprietorship': 'P',
  'sole_proprietorship': 'P',
  'sole proprietorship': 'P',
  'individual': 'P',

  // Trust (T)
  'trust': 'T',

  // HUF (H)
  'huf': 'H',
  'hindu_undivided_family': 'H',
  'hindu undivided family': 'H',

  // Association of Persons (A)
  'aop': 'A',
  'association_of_persons': 'A',
  'association of persons': 'A',

  // Body of Individuals (B)
  'boi': 'B',
  'body_of_individuals': 'B',
  'body of individuals': 'B',
}

export interface ValidatePanOptions {
  label?: string
  required?: boolean
  businessType?: string
}

export const getPanCategory = (pan: string): PanCategoryCode | null => {
  const clean = (pan || '').trim().toUpperCase()
  if (clean.length < 4) return null
  const code = clean.charAt(3) as PanCategoryCode
  return code in PAN_CATEGORIES ? code : null
}

export const isValidPan = (pan: string, businessType?: string): boolean => {
  return validatePan(pan, { businessType, required: true }) === null
}

export const validatePan = (
  pan: string | undefined | null,
  options?: ValidatePanOptions | string
): string | null => {
  const opts: ValidatePanOptions = typeof options === 'string' ? { label: options } : options || {}
  const required = opts.required !== false
  const raw = String(pan ?? '')

  if (!raw.trim()) {
    return required ? (opts.label ? `${opts.label} is required` : VALIDATION_MESSAGES.required) : null
  }

  // Reject spaces or special characters
  if (/\s/.test(raw)) {
    return VALIDATION_MESSAGES.pan
  }

  const upper = raw.trim().toUpperCase()

  // Must match basic PAN format: 5 uppercase letters, 4 digits, 1 uppercase letter
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(upper)) {
    return VALIDATION_MESSAGES.pan
  }

  // 4th character must indicate a valid PAN category code
  const holderCode = upper.charAt(3) as PanCategoryCode
  if (!PAN_CATEGORIES[holderCode]) {
    return VALIDATION_MESSAGES.panCategory
  }

  // Business-type matching when businessType is provided
  if (opts.businessType) {
    const normalizedType = opts.businessType.trim().toLowerCase()
    const expectedCategory = BUSINESS_TYPE_PAN_CATEGORY_MAP[normalizedType]
    if (expectedCategory) {
      const actualCategory = upper.charAt(3)
      if (actualCategory !== expectedCategory) {
        return VALIDATION_MESSAGES.panMismatch
      }
    }
  }

  return null
}

/** Validates PAN specifically for an individual person (4th character must be 'P') */
export const validateIndividualPan = (
  pan: string | undefined | null,
  label = 'PAN'
): string | null => {
  const baseErr = validatePan(pan, { label })
  if (baseErr) return baseErr
  const upper = String(pan ?? '').trim().toUpperCase()
  if (upper.charAt(3) !== 'P') {
    return VALIDATION_MESSAGES.panIndividual
  }
  return null
}
