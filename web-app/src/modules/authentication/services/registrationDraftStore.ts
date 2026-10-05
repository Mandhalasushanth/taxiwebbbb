import { sessionStore } from '@core/storage'

import type { RegistrationFormState } from '../validation/registrationValidation'

const DRAFT_KEY_PREFIX = 'taxedge.registrationDraft'

/** Passcodes are secrets and are never written to storage; they live only in component memory. */
type SecretField = 'password' | 'confirmPassword'
export type RegistrationDraft = Partial<Omit<RegistrationFormState, SecretField>>

const draftKey = (mobile: string): string => `${DRAFT_KEY_PREFIX}.${mobile.replace(/\D/g, '') || 'anonymous'}`

/**
 * Keeps in-progress Complete Profile data for this tab so moving back to
 * "Customer Type" and continuing again does not wipe what the user typed.
 */
export const registrationDraftStore = {
  load(mobile: string): RegistrationDraft | null {
    try {
      return sessionStore.get<RegistrationDraft>(draftKey(mobile))
    } catch {
      return null
    }
  },

  save(mobile: string, values: RegistrationFormState): void {
    try {
      const { password: _password, confirmPassword: _confirm, ...draft } = values
      sessionStore.set<RegistrationDraft>(draftKey(mobile), draft)
    } catch {
      /* storage full or blocked: the form still works, only persistence is lost */
    }
  },

  saveCustomerType(mobile: string, customerType: string): void {
    try {
      const current = sessionStore.get<RegistrationDraft>(draftKey(mobile)) ?? {}
      sessionStore.set<RegistrationDraft>(draftKey(mobile), { ...current, customerType })
    } catch {
      /* non-critical */
    }
  },

  clear(mobile: string): void {
    try {
      sessionStore.remove(draftKey(mobile))
    } catch {
      /* non-critical */
    }
  },
}
