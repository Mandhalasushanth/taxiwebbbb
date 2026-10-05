import { REGEX } from '@shared/constants'

/** Which profile form a customer type gets: personal KYC or business-entity details. */
export type ProfileKind = 'individual' | 'entity'

export const ENTITY_CUSTOMER_TYPES = ['partnership', 'llp', 'private_limited', 'company'] as const
export type EntityCustomerType = (typeof ENTITY_CUSTOMER_TYPES)[number]

export const isEntityCustomerType = (type?: string | null): type is EntityCustomerType =>
  (ENTITY_CUSTOMER_TYPES as readonly string[]).includes(type ?? '')

export const getProfileKind = (type?: string | null): ProfileKind =>
  isEntityCustomerType(type) ? 'entity' : 'individual'

export interface EntityFormConfig {
  nameLabel: string
  namePlaceholder: string
  registrationLabel: string
  registrationPlaceholder: string
  registrationRequired: boolean
  /** Null when the registration number has no fixed national format */
  registrationPattern: RegExp | null
  registrationMaxLength: number
  registrationFormatHint: string
  dateLabel: string
  panLabel: string
  /** 4th PAN character for this holder type (C = company, F = firm / LLP) */
  panHolderCode: string
}

const COMPANY_CONFIG: EntityFormConfig = {
  nameLabel: 'Company Name',
  namePlaceholder: 'Enter registered company name',
  registrationLabel: 'CIN',
  registrationPlaceholder: 'e.g. U12345MH2020PTC123456',
  registrationRequired: true,
  registrationPattern: REGEX.cin,
  registrationMaxLength: 21,
  registrationFormatHint: 'Enter a valid 21-character CIN',
  dateLabel: 'Incorporation Date',
  panLabel: 'Company PAN',
  panHolderCode: 'C',
}

export const ENTITY_FORM_CONFIG: Record<EntityCustomerType, EntityFormConfig> = {
  private_limited: COMPANY_CONFIG,
  company: COMPANY_CONFIG,
  llp: {
    nameLabel: 'LLP Name',
    namePlaceholder: 'Enter registered LLP name',
    registrationLabel: 'LLPIN',
    registrationPlaceholder: 'e.g. AAB-1234',
    registrationRequired: true,
    registrationPattern: REGEX.llpin,
    registrationMaxLength: 8,
    registrationFormatHint: 'Enter a valid LLPIN (e.g. AAB-1234)',
    dateLabel: 'Incorporation Date',
    panLabel: 'LLP PAN',
    panHolderCode: 'F',
  },
  partnership: {
    nameLabel: 'Firm Name',
    namePlaceholder: 'Enter registered firm name',
    registrationLabel: 'Firm Registration No.',
    registrationPlaceholder: 'Enter firm registration number (if registered)',
    registrationRequired: false,
    registrationPattern: /^[A-Z0-9/-]{4,30}$/,
    registrationMaxLength: 30,
    registrationFormatHint: 'Use 4–30 letters, digits, "/" or "-"',
    dateLabel: 'Date of Formation',
    panLabel: 'Firm PAN',
    panHolderCode: 'F',
  },
}

export const getEntityFormConfig = (type?: string | null): EntityFormConfig | null =>
  isEntityCustomerType(type) ? ENTITY_FORM_CONFIG[type] : null
