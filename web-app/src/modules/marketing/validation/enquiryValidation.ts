import { formatMobile, validateEmail, validateMobileNumber, validateName } from '@shared/utils'
import { CONTACT_SERVICE_OPTIONS } from '../data/marketingContent'
import type { EnquiryErrors, EnquiryField, EnquiryFormData } from '../types/marketing.types'

export const ENQUIRY_LIMITS = {
  name: 100,
  nameMinLetters: 2,
  email: 100,
  mobile: 10,
  messageMin: 10,
  messageMinLetters: 3,
  messageMax: 1000,
} as const

type FieldRule = (value: string) => string | null

const SERVICE_LABELS = new Set(CONTACT_SERVICE_OPTIONS.map((option) => option.label))

const PATTERNS = {
  letter: /[A-Za-z]/g,
  /** Two punctuation marks in a row, e.g. "..", "-'", ". -" */
  repeatedNamePunctuation: /[.'-]\s*[.'-]/,
  /** Names end with a letter or an initial's full stop ("Ravi K.") */
  nameEnding: /[A-Za-z.]$/,
  /** Same character ten or more times, e.g. "aaaaaaaaaa" */
  repeatedCharacter: /(.)\1{9,}/,
  link: /(https?:\/\/|www\.)\S+/i,
  /** Control characters other than tab / newline */
  controlCharacters: /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
} as const

const countLetters = (value: string): number => value.match(PATTERNS.letter)?.length ?? 0

const validateFullName = (value: string): string | null => {
  const baseError = validateName(value, 'Full name')
  if (baseError) return baseError
  const trimmed = value.trim()
  if (countLetters(trimmed) < ENQUIRY_LIMITS.nameMinLetters) {
    return `Full name must have at least ${ENQUIRY_LIMITS.nameMinLetters} letters`
  }
  if (PATTERNS.repeatedNamePunctuation.test(trimmed) || !PATTERNS.nameEnding.test(trimmed)) {
    return 'Enter a valid name (letters only)'
  }
  return null
}

const validateService = (value: string): string | null => {
  if (!value.trim()) return 'Please select a service'
  return SERVICE_LABELS.has(value) ? null : 'Please select a service from the list'
}

const validateMessage = (value: string): string | null => {
  const trimmed = value.trim()
  if (!trimmed) return 'Message is required'
  if (trimmed.length < ENQUIRY_LIMITS.messageMin) {
    return `Message must be at least ${ENQUIRY_LIMITS.messageMin} characters`
  }
  if (trimmed.length > ENQUIRY_LIMITS.messageMax) {
    return `Message cannot exceed ${ENQUIRY_LIMITS.messageMax} characters`
  }
  if (countLetters(trimmed) < ENQUIRY_LIMITS.messageMinLetters || PATTERNS.repeatedCharacter.test(trimmed)) {
    return 'Please describe how we can help in a few words'
  }
  return PATTERNS.link.test(trimmed) ? 'Please remove links from your message' : null
}

/** Each field is validated by what it asks for (name, email, Indian mobile, listed choice, free text) */
const ENQUIRY_RULES: Record<EnquiryField, FieldRule> = {
  fullName: validateFullName,
  email: (value) => validateEmail(value),
  mobile: (value) => validateMobileNumber(value),
  service: validateService,
  message: validateMessage,
}

export const validateEnquiryField = (field: EnquiryField, value: string): string | undefined =>
  ENQUIRY_RULES[field](value) || undefined

export const validateEnquiry = (data: EnquiryFormData): EnquiryErrors =>
  Object.fromEntries(
    (Object.keys(ENQUIRY_RULES) as EnquiryField[])
      .map((field) => [field, validateEnquiryField(field, data[field])] as const)
      .filter(([, message]) => Boolean(message)),
  ) as EnquiryErrors

/** Keeps the first "@" and drops any later ones */
const singleAt = (value: string): string => {
  const [local, ...rest] = value.split('@')
  return rest.length ? `${local}@${rest.join('')}` : local
}

/** Input filters applied while typing (and on paste) so only valid characters reach the form */
export const ENQUIRY_INPUT_FILTERS: Record<EnquiryField, (value: string) => string> = {
  fullName: (value) =>
    value.replace(/[^A-Za-z .'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ENQUIRY_LIMITS.name),
  email: (value) =>
    singleAt(value.replace(/[^A-Za-z0-9._%+@-]/g, ''))
      .toLowerCase()
      .slice(0, ENQUIRY_LIMITS.email),
  mobile: (value) => formatMobile(value).slice(0, ENQUIRY_LIMITS.mobile),
  service: (value) => value,
  message: (value) =>
    value
      .replace(PATTERNS.controlCharacters, '')
      .replace(/\n{3,}/g, '\n\n')
      .trimStart()
      .slice(0, ENQUIRY_LIMITS.messageMax),
}
