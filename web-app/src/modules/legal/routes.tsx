import type { RouteObject } from 'react-router-dom'
import { routePaths } from '@core/config'
import { LegalPage } from './pages/LegalPage/LegalPage'

/** Public routes: no auth guard, so policy links work before and after sign-in. */
export const legalRoutes: RouteObject[] = [{ path: routePaths.legal.document(), element: <LegalPage /> }]
