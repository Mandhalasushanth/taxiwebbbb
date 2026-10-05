import { PAN_HOLDER_TYPES, validatePan } from '@shared/utils'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'

/* ------------------------------------------------------------------ *
 * Constitution of business → PAN holder type (4th PAN character)
 * ------------------------------------------------------------------ */

type PanHolderCode = keyof typeof PAN_HOLDER_TYPES

/** Allowed 4th PAN characters per constitution; constitutions not listed accept any valid PAN */
export const CONSTITUTION_PAN_TYPES: Record<string, readonly PanHolderCode[]> = {
  Proprietorship: ['P'],
  Partnership: ['F'],
  'Limited Liability Partnership (LLP)': ['F'],
  'Private Limited Company': ['C'],
  'Public Limited Company': ['C'],
  'Hindu Undivided Family (HUF)': ['H'],
  'Society / Club / Trust / AOP': ['A', 'T', 'B'],
}

const PAN_HOLDER_INDEX = 3

const describeCodes = (codes: readonly PanHolderCode[]): string =>
  codes.map((code) => `"${code}" (${PAN_HOLDER_TYPES[code]})`).join(' or ')

/** PAN of the business itself must be issued to the selected constitution */
export const validateBusinessPan = (pan: string | undefined, constitution: string | undefined): string | undefined => {
  const baseError = validatePan(pan || '', 'Business PAN')
  if (baseError) return baseError
  const allowed = CONSTITUTION_PAN_TYPES[constitution || '']
  const holderCode = (pan || '').trim().toUpperCase().charAt(PAN_HOLDER_INDEX) as PanHolderCode
  if (!allowed || allowed.includes(holderCode)) return undefined
  return `For a ${constitution}, the PAN's 4th character must be ${describeCodes(allowed)}`
}

/* ------------------------------------------------------------------ *
 * Composition Scheme eligibility (CGST Act s.10(2)(c)-(d))
 * Inter-state outward supplies (incl. exports) and supplies through an
 * e-commerce operator are not allowed under the Composition Scheme.
 * ------------------------------------------------------------------ */

export const COMPOSITION_YES = 'Yes'

/** Options that make a business ineligible for the Composition Scheme, per field */
export const COMPOSITION_INELIGIBLE_OPTIONS = {
  natureOfBusiness: ['E-Commerce Operator / Seller', 'Export of Goods / Services'],
  registrationReason: ['Inter-State Supply', 'E-Commerce Seller / Operator'],
} as const satisfies Partial<Record<keyof GstBusinessFormData, readonly string[]>>

type CompositionField = keyof typeof COMPOSITION_INELIGIBLE_OPTIONS

export const COMPOSITION_INELIGIBLE_MESSAGE =
  'Not allowed with the Composition Scheme: inter-state / export supplies and e-commerce sales are ineligible. Choose "No" for Composition Scheme or pick another option.'

export const isCompositionOpted = (data: Pick<GstBusinessFormData, 'compositionScheme'>): boolean =>
  data.compositionScheme === COMPOSITION_YES

/** True when this option must be disabled because Composition Scheme = Yes */
export const isOptionBlockedByComposition = (
  field: CompositionField,
  option: string,
  compositionScheme: string,
): boolean =>
  compositionScheme === COMPOSITION_YES && (COMPOSITION_INELIGIBLE_OPTIONS[field] as readonly string[]).includes(option)

/** Field errors for selections that conflict with Composition Scheme = Yes */
export const getCompositionConflicts = (
  data: Pick<GstBusinessFormData, 'compositionScheme' | 'natureOfBusiness' | 'registrationReason'>,
): Partial<Record<CompositionField, string>> =>
  (Object.keys(COMPOSITION_INELIGIBLE_OPTIONS) as CompositionField[]).reduce<Partial<Record<CompositionField, string>>>(
    (acc, field) =>
      isOptionBlockedByComposition(field, data[field], data.compositionScheme)
        ? { ...acc, [field]: COMPOSITION_INELIGIBLE_MESSAGE }
        : acc,
    {},
  )
