import { PAN_HOLDER_TYPES, validatePan } from '@shared/utils'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'

/* ------------------------------------------------------------------ *
 * Constitution of business → PAN holder type (4th PAN character)
 * ------------------------------------------------------------------ */

type PanHolderCode = keyof typeof PAN_HOLDER_TYPES

/** Allowed 4th PAN characters per constitution; constitutions not listed accept any valid PAN */
export const CONSTITUTION_PAN_TYPES: Record<string, readonly PanHolderCode[]> = {
  Proprietorship: ['P'],
  'Partnership Firm': ['F'],
  Partnership: ['F'],
  'Limited Liability Partnership (LLP)': ['F'],
  'Private Limited Company': ['C'],
  'Public Limited Company': ['C'],
  HUF: ['H'],
  'Hindu Undivided Family (HUF)': ['H'],
  'Society / Trust / Club': ['A', 'T', 'B'],
  'Society / Club / Trust / AOP': ['A', 'T', 'B'],
  'AOP / BOI': ['A', 'B'],
  'AOP/BOI': ['A', 'B'],
  'Government Department': ['G'],
  'Foreign Company': ['C'],
  'Foreign company': ['C'],
  'One Person Company (OPC)': ['C'],
  'One person Company(OPC)': ['C'],
  'One person Company (OPC)': ['C'],
}

/** PAN of the business must follow common PAN validation for all entity types */
export const validateBusinessPan = (pan: string | undefined, _constitution?: string | undefined): string | undefined => {
  return validatePan(pan || '', 'Business PAN') || undefined
}

/* ------------------------------------------------------------------ *
 * Composition Scheme eligibility (CGST Act s.10(2)(c)-(d))
 * Inter-state outward supplies (incl. exports) and supplies through an
 * e-commerce operator are not allowed under the Composition Scheme.
 * ------------------------------------------------------------------ */

export const COMPOSITION_YES = 'Yes'

/** Options that make a business ineligible for the Composition Scheme, per field */
export const COMPOSITION_INELIGIBLE_OPTIONS = {
  natureOfBusiness: [
    'Exporter / Importer',
    'E-Commerce Operator / Seller',
    'Export of Goods / Services',
  ],
  registrationReason: [
    'Inter-state supply',
    'Inter-State Supply',
    'E-commerce operator / seller',
    'E-Commerce Seller / Operator',
    'Casual taxable person',
    'Input Service Distributor',
  ],
} as const satisfies Partial<Record<keyof GstBusinessFormData, readonly string[]>>

type CompositionField = keyof typeof COMPOSITION_INELIGIBLE_OPTIONS

export const COMPOSITION_INELIGIBLE_MESSAGE =
  'Not allowed with the Composition Scheme: inter-state / export supplies and e-commerce sales are ineligible. Choose "No - regular scheme" or pick another option.'

export const isCompositionOpted = (data: Pick<GstBusinessFormData, 'compositionScheme'>): boolean =>
  data.compositionScheme === 'Yes' ||
  data.compositionScheme === 'Yes - composition scheme' ||
  Boolean(typeof data.compositionScheme === 'string' && data.compositionScheme.startsWith('Yes'))

/** True when this option must be disabled because Composition Scheme = Yes */
export const isOptionBlockedByComposition = (
  field: CompositionField,
  option: string,
  compositionScheme: string,
): boolean =>
  isCompositionOpted({ compositionScheme }) && (COMPOSITION_INELIGIBLE_OPTIONS[field] as readonly string[]).includes(option)

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
