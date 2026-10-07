import { STORAGE_KEYS } from '../config/constants'
import { localStore } from '../storage/localStorage'
import { userRepository } from '../storage/userRepository'

import type { AuthTokens, AuthUser, RegisteredUserRecord } from './authTypes'

/** A registered-user entry as stored (older entries used `profile` instead of `user`) */
interface StoredRegisteredUser {
  mobile?: string
  passcode?: string
  isRegistered?: boolean
  user?: RegisteredUserRecord['user']
  profile?: RegisteredUserRecord['user']
}

const SCHEMA_VERSION = 'v16_clean_fresh_user_state'
try {
  if (localStore.get<string>('taxedge.auth_schema') !== SCHEMA_VERSION) {
    localStore.clear()
    localStore.set('taxedge.auth_schema', SCHEMA_VERSION)
  }
} catch {
  /* Ignore browser storage errors */
}

/** 
 * Storage layer proxy adhering to the repository pattern.
 * Bridges authentication tokens and registered user state through userRepository.
 */
export const authStorage = {
  getTokens(): AuthTokens | null {
    const session = userRepository.getSession() as { tokens: AuthTokens } | null
    if (session?.tokens) return session.tokens

    const accessToken = localStore.get<string>(STORAGE_KEYS.accessToken)
    const refreshToken = localStore.get<string>(STORAGE_KEYS.refreshToken)
    if (!accessToken || !refreshToken) {
      const user = localStore.get<AuthUser>(STORAGE_KEYS.user)
      if (user) {
        const fallbackTokens: AuthTokens = {
          accessToken: `tok_${user.id || 'usr'}_active`,
          refreshToken: `ref_${user.id || 'usr'}_active`,
        }
        localStore.set(STORAGE_KEYS.accessToken, fallbackTokens.accessToken)
        localStore.set(STORAGE_KEYS.refreshToken, fallbackTokens.refreshToken)
        return fallbackTokens
      }
      return null
    }
    return { accessToken, refreshToken }
  },

  setTokens(tokens: AuthTokens): void {
    const user = this.getUser()
    if (user) {
      userRepository.saveSession({ user, tokens })
    } else {
      localStore.set(STORAGE_KEYS.accessToken, tokens.accessToken)
      localStore.set(STORAGE_KEYS.refreshToken, tokens.refreshToken)
    }
  },

  getUser(): AuthUser | null {
    const session = userRepository.getSession() as { user: AuthUser } | null
    if (session?.user) return session.user

    const user = localStore.get<AuthUser>(STORAGE_KEYS.user)
    if (user) {
      const clean = (user.mobile || '').replace(/\D/g, '')
      const registered = clean ? this.getRegisteredUser(clean) : null
      const isComplete = Boolean(user.isProfileComplete || (registered && registered.isRegistered))
      return {
        ...user,
        isProfileComplete: isComplete,
      }
    }
    return null
  },

  setUser(user: AuthUser): void {
    const clean = (user.mobile || '').replace(/\D/g, '')
    const registered = clean ? this.getRegisteredUser(clean) : null
    const isComplete = Boolean(user.isProfileComplete || (registered && registered.isRegistered))
    const persistentUser: AuthUser = {
      ...user,
      isProfileComplete: isComplete,
    }

    const currentTokens = this.getTokens() || {
      accessToken: `tok_${user.id || 'usr'}_active`,
      refreshToken: `ref_${user.id || 'usr'}_active`,
    }

    userRepository.saveSession({ user: persistentUser, tokens: currentTokens })
  },

  getRegisteredUsers(): Record<string, RegisteredUserRecord> {
    const raw = localStore.get<Record<string, StoredRegisteredUser | null>>(STORAGE_KEYS.registeredUsers) || {}
    return Object.fromEntries(
      Object.entries(raw)
        .filter((entry): entry is [string, StoredRegisteredUser] => Boolean(entry[1]))
        .map(([key, val]) => [
          key,
          {
            mobile: val.mobile || key,
            passcode: val.passcode || '',
            isRegistered: Boolean(val.isRegistered),
            user: val.user || val.profile || { mobile: key },
          } as RegisteredUserRecord,
        ])
    )
  },

  getRegisteredUser(mobile: string): RegisteredUserRecord | null {
    const rec = userRepository.getUserRecord(mobile) as { mobile: string; passcode?: string; isRegistered: boolean; profile: AuthUser; user?: AuthUser } | null
    if (!rec) return null
    return {
      mobile: rec.mobile,
      passcode: rec.passcode || '',
      isRegistered: rec.isRegistered,
      user: rec.user || rec.profile,
    }
  },

  saveRegisteredUser(record: RegisteredUserRecord): void {
    const clean = (record.mobile || record.user?.mobile || '').replace(/\D/g, '')
    const userToSave: AuthUser = {
      ...record.user,
      mobile: clean,
      isProfileComplete: record.isRegistered,
    }
    userRepository.createUser(userToSave, record.passcode)
    const raw = localStore.get<Record<string, any>>(STORAGE_KEYS.registeredUsers) || {}
    raw[clean] = {
      mobile: clean,
      passcode: record.passcode || '',
      hasPasscode: Boolean(record.passcode),
      isRegistered: Boolean(record.isRegistered),
      profile: userToSave,
      user: userToSave,
    }
    localStore.set(STORAGE_KEYS.registeredUsers, raw)
  },

  isMobileRegistered(mobile: string): boolean {
    const rec = userRepository.getUserRecord(mobile) as { isRegistered: boolean } | null
    return Boolean(rec && rec.isRegistered)
  },

  hasPasscode(mobile: string): boolean {
    return Boolean(userRepository.hasPasscode(mobile))
  },

  clear(): void {
    userRepository.clearSession()
  },

  removeRegisteredUser(mobile: string): void {
    userRepository.removeUser(mobile)
  },

  clearAll(): void {
    userRepository.clearAll()
  },
}
