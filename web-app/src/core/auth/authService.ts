import { STORAGE_KEYS } from '../config/constants'
import { localStore } from '../storage/localStorage'

import { authStorage } from './authStorage'
import type { AuthSession, AuthUser, UserRole } from './authTypes'
import { markActivity } from './idleWatcher'
import { sessionSync, type SessionEndReason } from './sessionSync'

type Listener = (session: AuthSession | null, endReason?: SessionEndReason) => void

interface EndSessionOptions {
  /** false when reacting to a sign-out that already happened in another tab */
  broadcast?: boolean
}

const listeners = new Set<Listener>()

const notify = (session: AuthSession | null, endReason?: SessionEndReason) =>
  Array.from(listeners).map((listener) => listener(session, endReason))

/**
 * Infrastructure-level session handling: who is signed in, and their tokens.
 * Login/OTP/registration flows live in modules/authentication.
 */
export const authService = {
  getAccessToken(): string | null {
    return authStorage.getTokens()?.accessToken ?? null
  },
  getRefreshToken(): string | null {
    return authStorage.getTokens()?.refreshToken ?? null
  },
  getUser(): AuthUser | null {
    return authStorage.getUser()
  },
  isAuthenticated(): boolean {
    return Boolean(authStorage.getTokens()?.accessToken)
  },
  hasRole(...roles: UserRole[]): boolean {
    const user = authStorage.getUser()
    return user ? roles.includes(user.role) : false
  },
  /** Reason the last session ended, kept so the login screen can explain it (e.g. timeout). */
  getSessionEndReason(): SessionEndReason | null {
    return localStore.get<SessionEndReason>(STORAGE_KEYS.sessionEndReason)
  },
  clearSessionEndReason(): void {
    localStore.remove(STORAGE_KEYS.sessionEndReason)
  },
  startSession(session: AuthSession): void {
    authStorage.setTokens(session.tokens)
    authStorage.setUser(session.user)
    this.clearSessionEndReason()
    markActivity()
    notify(session)
  },
  updateUser(user: AuthUser): void {
    authStorage.setUser(user)
    const tokens = authStorage.getTokens()
    notify(tokens ? { user, tokens } : null)
  },
  endSession(reason: SessionEndReason = 'logout', { broadcast = true }: EndSessionOptions = {}): void {
    // Reason is stored before tokens are removed so storage-event listeners can read it
    localStore.set(STORAGE_KEYS.sessionEndReason, reason)
    authStorage.clear()
    localStore.remove(STORAGE_KEYS.lastActivity)
    if (broadcast) sessionSync.broadcastLogout(reason)
    notify(null, reason)
  },
  /** Lets providers react to sign-in / sign-out triggered anywhere (e.g. a 401). */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

/** Sign-out in any other tab ends the session here too (clears this tab's in-memory copy). */
sessionSync.onRemoteLogout((reason) => authService.endSession(reason, { broadcast: false }))
