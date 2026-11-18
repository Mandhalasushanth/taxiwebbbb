import type { RouteObject } from 'react-router-dom'
import { routePaths } from '@core/config'
import { CibilScorePage } from './pages/CibilScorePage'

export const cibilRoutes: RouteObject[] = [
  {
    path: (routePaths as Record<string, any>).cibil || '/cibil',
    element: <CibilScorePage />,
  },
]
