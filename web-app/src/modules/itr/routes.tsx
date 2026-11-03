import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { routePaths } from '@core/config'

const Itr = lazy(() => import('./components/Itr/Itr'))
const ItrFiling = lazy(() => import('./components/ItrFiling/ItrFiling'))
const TdsRefund = lazy(() => import('./components/TdsRefund/TdsRefund'))
const RevisedItr = lazy(() => import('./components/RevisedItr/RevisedItr'))

export const itrRoutes: RouteObject[] = [
  { path: routePaths.itr.root, element: <Itr /> },
  { path: routePaths.itr.itrFiling, element: <ItrFiling /> },
  { path: routePaths.itr.tdsRefund, element: <TdsRefund /> },
  { path: routePaths.itr.revisedItr, element: <RevisedItr /> },
]

export default itrRoutes
