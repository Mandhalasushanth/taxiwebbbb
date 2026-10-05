import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { buildLoginPath, isStaffRole, roleHasPermission } from '@core/auth'
import type { Permission } from '@core/auth'
import { routePaths } from '@core/config'
import { Loader } from '@shared/components'
import { useAuthStore } from '@store/index'

export interface StaffRouteProps {
  permission?: Permission
}

/**
 * Staff-only routes. Customers are sent back to their dashboard;
 * staff without the permission are sent to the staff dashboard.
 * Navigation and UX only — the backend enforces authorization.
 */
export const StaffRoute = ({ permission }: StaffRouteProps) => {
  const location = useLocation()
  const { isAuthenticated, isBootstrapping, user } = useAuthStore()

  if (isBootstrapping) return <Loader fullPage label="Checking your session" />

  if (!isAuthenticated || !user) {
    return <Navigate to={buildLoginPath(location)} replace />
  }

  if (!isStaffRole(user.role)) return <Navigate to={routePaths.dashboard} replace />

  if (permission && !roleHasPermission(user.role, permission)) {
    return <Navigate to={routePaths.staff.dashboard} replace />
  }

  return <Outlet />
}
