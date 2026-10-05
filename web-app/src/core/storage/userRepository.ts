import { localStore } from './localStorage'
import { STORAGE_KEYS } from '../config/constants'
import type { AuthSession, AuthUser } from '../auth/authTypes'

/**
 * Permanent user data structure stored across sessions.
 * Separated cleanly from temporary session data.
 */
export interface StoredUserRecord {
  mobile: string
  passcode?: string
  hasPasscode: boolean
  isRegistered: boolean
  profile: AuthUser
  user?: AuthUser
  selectedServices?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Storage / Data-access layer contract.
 * Both LocalStorage and API implementations conform to this contract.
 * React components call this abstraction and NEVER touch localStorage directly.
 */
export interface IUserRepository {
  getUserByMobile(mobile: string): AuthUser | null | Promise<AuthUser | null>
  getUserRecord(mobile: string): StoredUserRecord | null | Promise<StoredUserRecord | null>
  createUser(user: AuthUser, passcode?: string): StoredUserRecord | Promise<StoredUserRecord>
  updateUser(user: Partial<AuthUser> & { mobile: string }): AuthUser | Promise<AuthUser>
  hasPasscode(mobile: string): boolean | Promise<boolean>
  savePasscodeState(mobile: string, passcode: string): void | Promise<void>
  getPasscode(mobile: string): string | null | Promise<string | null>
  verifyPasscode(mobile: string, passcode: string): boolean | Promise<boolean>
  getProfile(mobile: string): AuthUser | null | Promise<AuthUser | null>
  saveProfile(mobile: string, profile: Partial<AuthUser>): void | Promise<void>
  getSession(): AuthSession | null | Promise<AuthSession | null>
  saveSession(session: AuthSession): void | Promise<void>
  clearSession(): void | Promise<void>
  removeUser(mobile: string): void | Promise<void>
  clearAll(): void | Promise<void>
}

/**
 * Temporary mock persistence layer utilizing localStorage.
 * Handles clean separation of permanent user records vs ephemeral session tokens.
 */
export class LocalStorageUserRepository implements IUserRepository {
  private clean(mobile: string): string {
    return (mobile || '').replace(/\D/g, '')
  }

  private getAllRecords(): Record<string, StoredUserRecord> {
    try {
      const records = localStore.get<Record<string, StoredUserRecord | { user?: AuthUser; passcode?: string; isRegistered?: boolean }>>(
        STORAGE_KEYS.registeredUsers
      ) || {}

      // Normalize legacy and new schema records
      const normalized: Record<string, StoredUserRecord> = {}
      for (const [key, val] of Object.entries(records)) {
        if (!val) continue
        const profile: AuthUser = (val as StoredUserRecord).profile || (val as { user?: AuthUser }).user || {
          id: `usr_${key}`,
          fullName: '',
          email: '',
          mobile: key,
          role: 'CUSTOMER',
          customerType: 'INDIVIDUAL',
          permissions: [],
          isProfileComplete: Boolean(val.isRegistered),
        }

        const passcode = val.passcode || ''
        const hasPass = Boolean(passcode && passcode.trim().length > 0)

        normalized[key] = {
          mobile: key,
          passcode,
          hasPasscode: hasPass,
          isRegistered: Boolean(val.isRegistered),
          profile,
          selectedServices: (val as StoredUserRecord).selectedServices || [],
          createdAt: (val as StoredUserRecord).createdAt || new Date().toISOString(),
          updatedAt: (val as StoredUserRecord).updatedAt || new Date().toISOString(),
        }
      }
      return normalized
    } catch {
      return {}
    }
  }

  private saveAllRecords(records: Record<string, StoredUserRecord>): void {
    try {
      localStore.set(STORAGE_KEYS.registeredUsers, records)
    } catch {
      // Safe fallback if quota exceeded
    }
  }

  getUserRecord(mobile: string): StoredUserRecord | null {
    const clean = this.clean(mobile)
    if (!clean) return null
    const records = this.getAllRecords()
    const record = records[clean]
    if (!record) return null

    return {
      ...record,
      hasPasscode: Boolean(record.passcode && record.passcode.trim().length > 0),
    }
  }

  getUserByMobile(mobile: string): AuthUser | null {
    const record = this.getUserRecord(mobile)
    return record?.profile || null
  }

  createUser(user: AuthUser, passcode?: string): StoredUserRecord {
    const clean = this.clean(user.mobile)
    const records = this.getAllRecords()
    const existing = records[clean]

    const cleanPasscode = (passcode || existing?.passcode || '').trim()
    const hasPass = Boolean(cleanPasscode.length > 0)
    const isReg = Boolean(hasPass || existing?.isRegistered || user.isProfileComplete)

    const fullProfile: AuthUser = {
      ...(existing?.profile || {}),
      ...user,
      id: user.id || existing?.profile?.id || `usr_${clean}`,
      mobile: clean,
      role: user.role || existing?.profile?.role || 'CUSTOMER',
      isProfileComplete: isReg,
    }

    const newRecord: StoredUserRecord = {
      mobile: clean,
      passcode: cleanPasscode,
      hasPasscode: hasPass,
      isRegistered: isReg,
      profile: fullProfile,
      user: fullProfile,
      selectedServices: existing?.selectedServices || [],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    records[clean] = newRecord
    this.saveAllRecords(records)
    return newRecord
  }

  updateUser(user: Partial<AuthUser> & { mobile: string }): AuthUser {
    const clean = this.clean(user.mobile)
    const existing = this.getUserRecord(clean)

    if (!existing) {
      const created = this.createUser({
        id: `usr_${clean}`,
        fullName: user.fullName || '',
        email: user.email || '',
        role: user.role || 'CUSTOMER',
        customerType: user.customerType || 'INDIVIDUAL',
        permissions: user.permissions || [],
        isProfileComplete: Boolean(user.isProfileComplete),
        ...user,
        mobile: clean,
      })
      return created.profile
    }

    const updatedProfile: AuthUser = {
      ...existing.profile,
      ...user,
      mobile: clean,
    }

    this.saveProfile(clean, updatedProfile)
    return updatedProfile
  }

  hasPasscode(mobile: string): boolean {
    const clean = this.clean(mobile)
    const record = this.getUserRecord(clean)
    return Boolean(record && record.hasPasscode && record.passcode && record.passcode.trim().length > 0)
  }

  savePasscodeState(mobile: string, passcode: string): void {
    const clean = this.clean(mobile)
    const records = this.getAllRecords()
    const existing = records[clean]
    const cleanPasscode = (passcode || '').trim()

    const updatedProfile: AuthUser = {
      ...(existing?.profile || {
        id: `usr_${clean}`,
        fullName: '',
        email: '',
        mobile: clean,
        role: 'CUSTOMER',
        customerType: 'INDIVIDUAL',
        permissions: [],
        isProfileComplete: true,
      }),
      isProfileComplete: true,
    }

    records[clean] = {
      mobile: clean,
      passcode: cleanPasscode,
      hasPasscode: Boolean(cleanPasscode.length > 0),
      isRegistered: true,
      profile: updatedProfile,
      selectedServices: existing?.selectedServices || [],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.saveAllRecords(records)
  }

  getPasscode(mobile: string): string | null {
    const record = this.getUserRecord(mobile)
    return record?.passcode || null
  }

  verifyPasscode(mobile: string, passcode: string): boolean {
    const stored = this.getPasscode(mobile)
    if (!stored) return false
    return stored === (passcode || '').trim()
  }

  getProfile(mobile: string): AuthUser | null {
    return this.getUserByMobile(mobile)
  }

  saveProfile(mobile: string, profile: Partial<AuthUser>): void {
    const clean = this.clean(mobile)
    const records = this.getAllRecords()
    const existing = records[clean]

    const mergedProfile: AuthUser = {
      ...(existing?.profile || {
        id: `usr_${clean}`,
        fullName: '',
        email: '',
        mobile: clean,
        role: 'CUSTOMER',
        customerType: 'INDIVIDUAL',
        permissions: [],
        isProfileComplete: Boolean(existing?.isRegistered),
      }),
      ...profile,
      mobile: clean,
    }

    records[clean] = {
      mobile: clean,
      passcode: existing?.passcode || '',
      hasPasscode: Boolean(existing?.hasPasscode),
      isRegistered: Boolean(existing?.isRegistered || mergedProfile.isProfileComplete),
      profile: mergedProfile,
      selectedServices: existing?.selectedServices || [],
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.saveAllRecords(records)
  }

  getSession(): AuthSession | null {
    try {
      const accessToken = localStore.get<string>(STORAGE_KEYS.accessToken)
      const refreshToken = localStore.get<string>(STORAGE_KEYS.refreshToken)
      const user = localStore.get<AuthUser>(STORAGE_KEYS.user)

      if (!accessToken || !refreshToken || !user) {
        return null
      }

      // Sync active session user with latest persistent profile
      const clean = this.clean(user.mobile)
      const record = this.getUserRecord(clean)
      const latestUser: AuthUser = record?.profile ? {
        ...record.profile,
        isProfileComplete: Boolean(record.isRegistered || record.hasPasscode || user.isProfileComplete),
      } : user

      return {
        user: latestUser,
        tokens: { accessToken, refreshToken },
      }
    } catch {
      return null
    }
  }

  saveSession(session: AuthSession): void {
    try {
      localStore.set(STORAGE_KEYS.accessToken, session.tokens.accessToken)
      localStore.set(STORAGE_KEYS.refreshToken, session.tokens.refreshToken)
      localStore.set(STORAGE_KEYS.user, session.user)
    } catch {
      // Safe fallback
    }
  }

  clearSession(): void {
    try {
      localStore.remove(STORAGE_KEYS.accessToken)
      localStore.remove(STORAGE_KEYS.refreshToken)
      localStore.remove(STORAGE_KEYS.user)
    } catch {
      // Safe fallback
    }
  }

  removeUser(mobile: string): void {
    const clean = this.clean(mobile)
    const records = this.getAllRecords()
    delete records[clean]
    this.saveAllRecords(records)
  }

  clearAll(): void {
    this.clearSession()
    try {
      localStore.remove(STORAGE_KEYS.registeredUsers)
      localStore.remove('taxedge.userApplications')
      localStore.remove('taxedge.applicationDrafts')
    } catch {}
  }
}

/**
 * Backend-ready API implementation for future connection.
 * When backend is live, switching to this requires ZERO changes to UI components.
 */
export class ApiUserRepository implements IUserRepository {
  async getUserByMobile(_mobile: string): Promise<AuthUser | null> {
    return null
  }

  async getUserRecord(_mobile: string): Promise<StoredUserRecord | null> {
    return null
  }

  async createUser(user: AuthUser, passcode?: string): Promise<StoredUserRecord> {
    return {
      mobile: user.mobile,
      passcode,
      hasPasscode: Boolean(passcode),
      isRegistered: user.isProfileComplete,
      profile: user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async updateUser(user: Partial<AuthUser> & { mobile: string }): Promise<AuthUser> {
    return user as AuthUser
  }

  async hasPasscode(_mobile: string): Promise<boolean> {
    return false
  }

  async savePasscodeState(_mobile: string, _passcode: string): Promise<void> {}

  async getPasscode(_mobile: string): Promise<string | null> {
    return null
  }

  async verifyPasscode(_mobile: string, _passcode: string): Promise<boolean> {
    return false
  }

  async getProfile(mobile: string): Promise<AuthUser | null> {
    return this.getUserByMobile(mobile)
  }

  async saveProfile(_mobile: string, _profile: Partial<AuthUser>): Promise<void> {}

  getSession(): AuthSession | null {
    return null
  }

  saveSession(_session: AuthSession): void {}

  clearSession(): void {}

  removeUser(_mobile: string): void {}

  clearAll(): void {}
}

export const localStorageUserRepository = new LocalStorageUserRepository()
export const apiUserRepository = new ApiUserRepository()

/**
 * Active repository abstraction.
 * Switchable to apiUserRepository when backend is live.
 */
export const userRepository: IUserRepository = localStorageUserRepository
