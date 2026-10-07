import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { buildLoginPath } from '@core/auth'
import { routePaths } from '@core/config'
import { Loader } from '@shared/components'
import { useAuthStore } from '@store/index'

import { buildProfilePromptState, isProfileFreePath } from './profileGate'

/**
 * Customer-only routes. Customers with an incomplete profile
 * are sent to the dashboard's "Complete Your Profile" prompt.
 */
export const CustomerRoute = () => {
  const location = useLocation()
  const { isAuthenticated, isBootstrapping, user } = useAuthStore()

  if (isBootstrapping) return <Loader fullPage label="Checking your session" />

  if (!isAuthenticated || !user) {
    return <Navigate to={buildLoginPath(location)} replace />
  }

  // Profile gate: service pages opened by direct URL need a completed profile
  if (!user.isProfileComplete && !isProfileFreePath(location.pathname)) {
    return (
      <Navigate
        to={routePaths.dashboard}
        state={buildProfilePromptState(location.pathname, location.search)}
        replace
      />
    )
  }

  return <Outlet />
}
