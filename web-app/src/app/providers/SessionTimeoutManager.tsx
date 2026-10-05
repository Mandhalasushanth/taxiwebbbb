import { useEffect } from 'react'

import { startIdleWatcher } from '@core/auth'
import { appConfig } from '@core/config'
import { useAuthStore } from '@store/index'

/**
 * Signs the user out after `appConfig.session.idleTimeoutMs` without interaction in any tab.
 * The route guards then send every tab to the login page, which shows the timeout notice.
 */
export const SessionTimeoutManager = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const expireSession = useAuthStore((state) => state.expireSession)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    return startIdleWatcher({
      timeoutMs: appConfig.session.idleTimeoutMs,
      activityWriteThrottleMs: appConfig.session.activityWriteThrottleMs,
      checkIntervalMs: appConfig.session.idleCheckIntervalMs,
      onTimeout: () => expireSession('timeout'),
    })
  }, [isAuthenticated, expireSession])

  return null
}
