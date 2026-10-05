import { validatePan } from '@shared/utils'

import { getEntityFormConfig } from '../constants/profileFormConfig'

const ENTITY_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .&'(),/-]{1,149}$/
const PAN_HOLDER_CODE_INDEX = 3

export const validateEntityName = (value: string, customerType: string): string | undefined => {
  const label = getEntityFormConfig(customerType)?.nameLabel ?? 'Entity Name'
  const trimmed = value.trim()
  if (!trimmed) return `${label} is required`
  if (!ENTITY_NAME_PATTERN.test(trimmed)) return `Enter a valid ${label.toLowerCase()}`
  return undefined
}

export const validateRegistrationNumber = (value: string, customerType: string): string | undefined => {
  const config = getEntityFormConfig(customerType)
  if (!config) return undefined
  const trimmed = value.trim().toUpperCase()
  if (!trimmed) return config.registrationRequired ? `${config.registrationLabel} is required` : undefined
  if (config.registrationPattern && !config.registrationPattern.test(trimmed)) {
    return config.registrationFormatHint
  }
  return undefined
}

/** PAN must be valid and issued to this holder type (4th char C for companies, F for firms / LLPs). */
export const validateEntityPan = (value: string, customerType: string): string | undefined => {
  const config = getEntityFormConfig(customerType)
  const label = config?.panLabel ?? 'PAN'
  const baseError = validatePan(value, label)
  if (baseError) return baseError
  const holderCode = value.trim().toUpperCase().charAt(PAN_HOLDER_CODE_INDEX)
  if (config && holderCode !== config.panHolderCode) {
    return `${label} must have "${config.panHolderCode}" as its 4th character`
  }
  return undefined
}
