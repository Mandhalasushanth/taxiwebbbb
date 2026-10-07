import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { NotFound } from '../pages/NotFound'

import { routePaths } from '@core/config'
import { applicationsRoutes } from '@modules/applications/routes'
import { authenticationRoutes } from '@modules/authentication/routes'
import { businessRoutes } from '@modules/business/routes'
import { customerSupportRoutes } from '@modules/customerSupport/routes'
import { CustomerTypePage } from '@modules/customerType'
import { dashboardRoutes } from '@modules/dashboard/routes'
import { documentsRoutes } from '@modules/documents/routes'
import { gstRoutes } from '@modules/gst/routes'
import { incorporationRoutes } from '@modules/incorporation/routes'
import { insuranceRoutes } from '@modules/insurance/routes'
import { legalRoutes } from '@modules/legal/routes'
import { itrRoutes } from '@modules/itr/routes'
// Import the routes file directly: the loans barrel also exports every loan page, which would defeat lazy loading
import { loansRoutes } from '@modules/loans/routes'
import { paymentsRoutes } from '@modules/payments/routes'
import { profileRoutes } from '@modules/profile/routes'
import { notificationsRoutes } from '@modules/notifications'

import { CustomerRoute } from './CustomerRoute'
import { PublicRoute } from './PublicRoute'

const authLayoutRoutes = authenticationRoutes.filter(
  (r) =>
    r.path !== routePaths.auth.createProfile &&
    r.path !== routePaths.auth.customerType,
)

/**
 * Modules own their own routes and export them from their barrel;
 * this file only decides which layout and guard wraps each group.
 */
export const routeConfig: RouteObject[] = [
  {
    path: routePaths.root,
    element: <Navigate to={routePaths.auth.login} replace />,
  },
  {
    path: routePaths.registration,
    element: <Navigate to={routePaths.auth.register} replace />,
  },
  {
    path: routePaths.auth.createProfile,
    element: <Navigate to={routePaths.auth.register} replace />,
  },
  {
    path: routePaths.customerType,
    element: <CustomerTypePage />,
  },
  {
    path: routePaths.auth.customerType,
    element: <CustomerTypePage />,
  },

  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: authLayoutRoutes,
      },
    ],
  },
  {
    element: <CustomerRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to={routePaths.dashboard} replace /> },
          ...dashboardRoutes,
          ...incorporationRoutes,
          ...businessRoutes,
          ...gstRoutes,
          ...itrRoutes,
          ...loansRoutes,
          ...insuranceRoutes,
          ...paymentsRoutes,
          ...documentsRoutes,
          ...applicationsRoutes,
          ...profileRoutes,
          ...customerSupportRoutes,
          ...notificationsRoutes,
        ],
      },
    ],
  },
  // Public policy pages (Terms / Privacy) — no guard, reachable signed in or out
  ...legalRoutes,
  { path: routePaths.notFound, element: <NotFound /> },
]
