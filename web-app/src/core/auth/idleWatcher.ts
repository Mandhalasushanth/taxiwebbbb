import { STORAGE_KEYS } from '../config/constants'
import { localStore } from '../storage/localStorage'

export interface IdleWatcherOptions {
  timeoutMs: number
  activityWriteThrottleMs: number
  checkIntervalMs: number
  onTimeout: () => void
}

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'] as const

/** Last user activity across all tabs (tabs share it so an active tab keeps the others alive). */
export const getLastActivity = (): number | null => localStore.get<number>(STORAGE_KEYS.lastActivity)

export const markActivity = (at: number = Date.now()): void => localStore.set(STORAGE_KEYS.lastActivity, at)

export const isIdleExpired = (timeoutMs: number, now: number = Date.now()): boolean => {
  const last = getLastActivity()
  return last !== null && now - last >= timeoutMs
}

/**
 * Starts watching for user inactivity. Calls `onTimeout` once when no activity has been
 * seen in any tab for `timeoutMs`. Returns a cleanup function.
 */
export const startIdleWatcher = ({
  timeoutMs,
  activityWriteThrottleMs,
  checkIntervalMs,
  onTimeout,
}: IdleWatcherOptions): (() => void) => {
  let lastWrite = 0
  let hasTimedOut = false

  const checkIdle = () => {
    if (hasTimedOut || !isIdleExpired(timeoutMs)) return
    hasTimedOut = true
    onTimeout()
  }

  const handleActivity = () => {
    const now = Date.now()
    if (hasTimedOut || now - lastWrite < activityWriteThrottleMs) return
    // A tab waking up after the limit must not revive an already-expired session
    if (isIdleExpired(timeoutMs, now)) {
      checkIdle()
      return
    }
    lastWrite = now
    markActivity(now)
  }

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') checkIdle()
  }

  // Session restored after a long idle gap (e.g. reopened browser) expires right away
  checkIdle()
  if (!hasTimedOut) {
    lastWrite = Date.now()
    markActivity(lastWrite)
  }

  ACTIVITY_EVENTS.map((name) => window.addEventListener(name, handleActivity, { passive: true }))
  document.addEventListener('visibilitychange', handleVisibility)
  const intervalId = window.setInterval(checkIdle, checkIntervalMs)

  return () => {
    ACTIVITY_EVENTS.map((name) => window.removeEventListener(name, handleActivity))
    document.removeEventListener('visibilitychange', handleVisibility)
    window.clearInterval(intervalId)
  }
}
