import { authStorage } from '@core/auth'

/** Fields that must be unique across accounts */
export type UniqueIdentityField = 'pan' | 'email'
export type IdentityConflicts = Partial<Record<UniqueIdentityField, string>>

export const DUPLICATE_MESSAGES: Record<UniqueIdentityField, string> = {
  pan: 'This PAN is already registered with another account',
  email: 'This email is already registered with another account',
}

export interface IdentityCandidate {
  mobile: string
  pan?: string
  email?: string
}

const normalizePan = (pan?: string) => (pan ?? '').trim().toUpperCase()
const normalizeEmail = (email?: string) => (email ?? '').trim().toLowerCase()
const digitsOf = (value: string) => value.replace(/\D/g, '')

/**
 * Finds PAN / email values already used by a different account (a different mobile number).
 * The same user re-saving their own profile is never a conflict.
 */
export const findIdentityConflicts = ({ mobile, pan, email }: IdentityCandidate): IdentityConflicts => {
  const ownMobile = digitsOf(mobile)
  const panKey = normalizePan(pan)
  const emailKey = normalizeEmail(email)
  const otherAccounts = Object.values(authStorage.getRegisteredUsers()).filter(
    (record) => record.isRegistered && digitsOf(record.mobile) !== ownMobile,
  )

  const panTaken = Boolean(panKey) && otherAccounts.some((record) => normalizePan(record.user?.pan) === panKey)
  const emailTaken = Boolean(emailKey) && otherAccounts.some((record) => normalizeEmail(record.user?.email) === emailKey)

  return {
    ...(panTaken ? { pan: DUPLICATE_MESSAGES.pan } : {}),
    ...(emailTaken ? { email: DUPLICATE_MESSAGES.email } : {}),
  }
}

/** Raised by the registration service when PAN / email belong to another account. */
export class DuplicateIdentityError extends Error {
  readonly conflicts: IdentityConflicts

  constructor(conflicts: IdentityConflicts) {
    super(Object.values(conflicts).join('. '))
    this.name = 'DuplicateIdentityError'
    this.conflicts = conflicts
  }
}
