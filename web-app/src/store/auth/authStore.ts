import { create } from 'zustand'

import { authService } from '@core/auth'
import type { AuthSession, AuthUser, SessionEndReason } from '@core/auth'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  /** Why the last session ended (shown on the login screen), null while signed in. */
  sessionEndReason: SessionEndReason | null
  signIn: (session: AuthSession) => void
  signOut: () => void
  /** Ends the session for a system reason such as inactivity timeout. */
  expireSession: (reason: SessionEndReason) => void
  clearSessionEndReason: () => void
  setUser: (user: AuthUser) => void
  bootstrap: () => void
}

const initialEndReason = (): SessionEndReason | null =>
  authService.isAuthenticated() ? null : authService.getSessionEndReason()

/**
 * Reactive mirror of the session held by core/auth.
 * core/auth owns persistence; this store owns re-rendering.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getUser(),
  isAuthenticated: authService.isAuthenticated(),
  isBootstrapping: false,
  sessionEndReason: initialEndReason(),

  signIn: (session) => {
    authService.startSession(session)
    set({ user: session.user, isAuthenticated: true, sessionEndReason: null })
  },

  signOut: () => {
    authService.endSession('logout')
  },

  expireSession: (reason) => {
    authService.endSession(reason)
  },

  clearSessionEndReason: () => {
    authService.clearSessionEndReason()
    set({ sessionEndReason: null })
  },

  setUser: (user) => {
    authService.updateUser(user)
    set({ user })
  },

  bootstrap: () => {
    set({
      user: authService.getUser(),
      isAuthenticated: authService.isAuthenticated(),
      isBootstrapping: false,
      sessionEndReason: initialEndReason(),
    })
  },
}))

/** Keeps the store in sync when a session starts/ends outside React (another tab, timeout, 401). */
authService.subscribe((session, endReason) => {
  useAuthStore.setState({
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    sessionEndReason: session ? null : endReason ?? null,
  })
})
