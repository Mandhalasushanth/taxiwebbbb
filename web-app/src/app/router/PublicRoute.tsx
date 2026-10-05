import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@store/index'

import { resolvePostLoginPath } from '@core/auth'
import { routePaths } from '@core/config'

/**
 * Keeps signed-in users with complete profiles out of the login / register screens,
 * sending them to the page they originally requested (?redirect=) or the dashboard.
 */
export const PublicRoute = () => {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  return isAuthenticated && user?.isProfileComplete ? (
    <Navigate to={resolvePostLoginPath(location.search, location.state, routePaths.dashboard)} replace />
  ) : (
    <Outlet />
  )
}
