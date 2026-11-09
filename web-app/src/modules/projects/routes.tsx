import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { routePaths } from '@core/config'

const ProjectsPage = lazy(() => import('./pages/Projects/Projects'))

export const projectsRoutes: RouteObject[] = [
  {
    path: routePaths.projects,
    element: <ProjectsPage />,
  },
]

