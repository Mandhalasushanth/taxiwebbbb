// @vitest-environment jsdom
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authService, buildLoginPath, resolvePostLoginPath, startIdleWatcher } from '../../src/core/auth'
import { STORAGE_KEYS } from '../../src/core/config/constants'
import { useAuthStore } from '../../src/store/auth/authStore'

const SESSION = {
  user: { id: 'usr_1', fullName: 'Test User', email: 't@x.in', mobile: '9823145672', role: 'CUSTOMER', permissions: [], isProfileComplete: true },
  tokens: { accessToken: 'tok_a', refreshToken: 'ref_a' },
} as const

describe('BUG-LGN-009: redirect to requested URL after login', () => {
  it('builds a login URL carrying the full requested path', () => {
    expect(buildLoginPath({ pathname: '/gst/filing', search: '?step=2', hash: '' })).toBe(
      '/auth/login?redirect=%2Fgst%2Ffiling%3Fstep%3D2'
    )
  })

  it('resolves the redirect param, then router state, then the fallback', () => {
    expect(resolvePostLoginPath('?redirect=%2Fgst%2Ffiling', null, '/dashboard')).toBe('/gst/filing')
    expect(resolvePostLoginPath('', { returnTo: '/itr' }, '/dashboard')).toBe('/itr')
    expect(resolvePostLoginPath('', { from: '/staff/queue' }, '/dashboard')).toBe('/staff/queue')
    expect(resolvePostLoginPath('', null, '/dashboard')).toBe('/dashboard')
  })

  it('ignores unsafe or auth-page redirects', () => {
    expect(resolvePostLoginPath('?redirect=%2F%2Fevil.com', null, '/dashboard')).toBe('/dashboard')
    expect(resolvePostLoginPath('?redirect=https%3A%2F%2Fevil.com', null, '/dashboard')).toBe('/dashboard')
    expect(resolvePostLoginPath('?redirect=%2Fauth%2Flogin', null, '/dashboard')).toBe('/dashboard')
  })
})

describe('BUG-LGN-007: cross-tab logout', () => {
  beforeEach(() => useAuthStore.getState().signIn(SESSION as never))

  it('signs this tab out when another tab removes the access token', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    window.localStorage.removeItem(STORAGE_KEYS.accessToken)
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.accessToken, oldValue: '"tok_a"', newValue: null }))
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(authService.isAuthenticated()).toBe(false)
  })
})

describe('BUG-LGN-008: inactivity timeout', () => {
  const options = { timeoutMs: 30 * 60 * 1000, activityWriteThrottleMs: 15000, checkIntervalMs: 30000 }

  beforeEach(() => {
    vi.useFakeTimers()
    useAuthStore.getState().signIn(SESSION as never)
  })
  afterEach(() => vi.useRealTimers())

  it('expires the session after 30 idle minutes with a timeout reason', () => {
    const stop = startIdleWatcher({ ...options, onTimeout: () => useAuthStore.getState().expireSession('timeout') })
    vi.advanceTimersByTime(29 * 60 * 1000)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    vi.advanceTimersByTime(2 * 60 * 1000)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().sessionEndReason).toBe('timeout')
    stop()
  })

  it('keeps the session alive while the user is active', () => {
    const onTimeout = vi.fn()
    const stop = startIdleWatcher({ ...options, onTimeout })
    Array.from({ length: 4 }).map(() => {
      vi.advanceTimersByTime(20 * 60 * 1000)
      window.dispatchEvent(new Event('keydown'))
    })
    expect(onTimeout).not.toHaveBeenCalled()
    stop()
  })
})
