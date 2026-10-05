import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

import { routePaths } from '@core/config'

const GSTDashboard = lazy(() => import('./components/GSTDashboard/GSTDashboard'))
const GSTRegistration = lazy(() => import('./components/GSTRegistration/GSTRegistration'))
const GSTReturn = lazy(() => import('./components/GSTReturn/GSTReturn'))
const GSTFiling = lazy(() => import('./components/GSTFiling/GSTFiling'))
const GSTDetails = lazy(() => import('./components/GSTDetails/GSTDetails'))
const GSTTrack = lazy(() => import('./components/GSTTrack/GSTTrack'))
const GSTAmendment = lazy(() => import('./components/GSTAmendment/GSTAmendment'))
const GSTCertificate = lazy(() => import('./components/GSTCertificate/GSTCertificate'))
const GSTCompliance = lazy(() => import('./components/GSTCompliance/GSTCompliance'))
const GSTCancellation = lazy(() => import('./components/GSTCancellation/GSTCancellation'))


export const gstRoutes: RouteObject[] = [
  { path: routePaths.gst.root, element: <GSTDashboard /> },
  { path: routePaths.gst.registration, element: <GSTRegistration /> },
  { path: '/gst/registration/documents', element: <GSTRegistration /> },
  { path: '/gst/registration-documents', element: <GSTRegistration /> },
  { path: routePaths.gst.returns, element: <GSTReturn /> },
  { path: routePaths.gst.filing, element: <GSTFiling /> },
  { path: routePaths.gst.amendment, element: <GSTAmendment /> },
  { path: routePaths.gst.certificate, element: <GSTCertificate /> },
  { path: routePaths.gst.compliance, element: <GSTCompliance /> },
  { path: routePaths.gst.complianceSubmitted, element: <GSTCompliance /> },
  { path: routePaths.gst.cancellation, element: <GSTCancellation /> },
  { path: routePaths.gst.cancellationSubmitted, element: <GSTCancellation /> },
  { path: '/gst/file-period', element: <GSTFiling /> },
  { path: '/gst/file-upload', element: <GSTFiling /> },
  { path: '/gst/file-review', element: <GSTFiling /> },
  { path: '/gst/file-payment', element: <GSTFiling /> },
  { path: '/gst/file-success', element: <GSTFiling /> },
  { path: '/gst/file-receipt', element: <GSTFiling /> },
  { path: routePaths.gst.detail(), element: <GSTDetails /> },
  { path: routePaths.gst.track(), element: <GSTTrack /> },
]
