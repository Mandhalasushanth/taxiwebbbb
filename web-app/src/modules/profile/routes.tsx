import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import { routePaths } from '@core/config'

const Profile = lazy(() => import('./pages/Profile/Profile'))
const PersonalInformation = lazy(() => import('./pages/PersonalInformation/PersonalInformation'))
const KycDetails = lazy(() => import('./pages/KycDetails/KycDetails'))
const Settings = lazy(() => import('./pages/Settings/Settings'))

export const profileRoutes: RouteObject[] = [
  { path: routePaths.profile, element: <Profile /> },
  { path: routePaths.profilePersonal, element: <PersonalInformation /> },
  { path: routePaths.profileKyc, element: <KycDetails /> },
  { path: routePaths.profileSettings, element: <Settings /> },
  { path: routePaths.settings, element: <Settings /> },
]
