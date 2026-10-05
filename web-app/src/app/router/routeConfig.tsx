import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'

import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { StaffLayout } from '../layouts/StaffLayout'
import { NotFound } from '../pages/NotFound'

import { routePaths } from '@core/config'
import { applicationsRoutes } from '@modules/applications'
import { authenticationRoutes } from '@modules/authentication'
import { businessRoutes } from '@modules/business'
import { customerSupportRoutes } from '@modules/customerSupport'
import { CustomerTypePage } from '@modules/customerType'
import { dashboardRoutes } from '@modules/dashboard'
import { documentsRoutes } from '@modules/documents'
import { gstRoutes } from '@modules/gst'
import { incorporationRoutes } from '@modules/incorporation'
import { insuranceRoutes } from '@modules/insurance'
import { legalRoutes } from '@modules/legal'
import { itrRoutes } from '@modules/itr'
import { loansRoutes } from '@modules/loans'
import { paymentsRoutes } from '@modules/payments'
import { profileRoutes } from '@modules/profile'
import { staffRoutes } from '@modules/staff'
import { notificationsRoutes } from '@modules/notifications'

import { CustomerRoute } from './CustomerRoute'
import { PublicRoute } from './PublicRoute'
import { StaffRoute } from './StaffRoute'

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
    element: <StaffRoute />,
    children: [{ element: <StaffLayout />, children: staffRoutes }],
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
