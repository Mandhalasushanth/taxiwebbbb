import { useCallback } from 'react'
import { NavigationType, useBlocker } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { routePaths } from '@core/config'
import { LogoutConfirmModal } from '@shared/components'
import { useAuthStore } from '@store/index'
import { useLogoutConfirm } from '../../hooks/useLogoutConfirm'

const toPaths = (group: Record<string, unknown>): string[] =>
  Object.values(group).filter((value): value is string => typeof value === 'string' && value.startsWith('/'))

/** Pages that belong before sign-in: the marketing site and the login / register screens */
const PRE_LOGIN_PATHS = new Set([routePaths.root, ...toPaths(routePaths.marketing), ...toPaths(routePaths.auth)])

const isPreLoginPath = (pathname: string): boolean => PRE_LOGIN_PATHS.has(pathname)

interface BlockerArgs {
  nextLocation: Location
  historyAction: NavigationType
}

/**
 * The browser Back button would take a signed-in user from the app back to the
 * marketing site / login screen while still signed in. Instead, ask whether they
 * want to log out: Cancel keeps them where they are, Log out ends the session.
 *
 * React Router honours a single blocker at a time, so render this only on pages
 * that have no other blocker (the dashboard), never on draft-protected service pages.
 */
export const BackNavigationLogoutGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useLogoutConfirm()

  const shouldBlock = useCallback(
    ({ nextLocation, historyAction }: BlockerArgs) =>
      isAuthenticated && historyAction === NavigationType.Pop && isPreLoginPath(nextLocation.pathname),
    [isAuthenticated],
  )
  const blocker = useBlocker(shouldBlock)

  const handleCancel = useCallback(() => {
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  const handleConfirm = useCallback(() => {
    // Start the sign-out first so the popup stays open (as "Logging out…") after the blocker resets
    void logout.confirmLogout()
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker, logout])

  return (
    <LogoutConfirmModal
      isOpen={blocker.state === 'blocked' || logout.isLoggingOut}
      isLoggingOut={logout.isLoggingOut}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
}
