import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { routePaths } from '@core/config'

const SelectCompanyType = lazy(() => import('./components/SelectCompanyType/SelectCompanyType'))
const CompanyDetails = lazy(() => import('./components/CompanyDetails/CompanyDetails'))
const RegisteredOffice = lazy(() => import('./components/RegisteredOffice/RegisteredOffice'))
const PromoterDetails = lazy(() => import('./components/PromoterDetails/PromoterDetails'))
const CapitalDetails = lazy(() => import('./components/CapitalDetails/CapitalDetails'))
const DocumentsKyc = lazy(() => import('./components/DocumentsKyc/DocumentsKyc'))
const ReviewApplication = lazy(() => import('./components/ReviewApplication/ReviewApplication'))
const SubmissionSuccess = lazy(() => import('./components/SubmissionSuccess/SubmissionSuccess'))

import { IncorporationFlowSteps } from './components'

export const incorporationRoutes: RouteObject[] = [
  {
    path: routePaths.incorporation.root,
    element: <Navigate to={routePaths.incorporation.selectType} replace />,
  },
  {
    element: <IncorporationFlowSteps />,
    children: [
      {
        path: routePaths.incorporation.selectType,
        element: <SelectCompanyType />,
      },
      // 7 Core Incorporation Steps
      {
        path: routePaths.incorporation.companyDetails,
        element: <CompanyDetails />,
      },
      {
        path: routePaths.incorporation.registeredOffice,
        element: <RegisteredOffice />,
      },
      {
        path: routePaths.incorporation.promoterDetails,
        element: <PromoterDetails />,
      },
      {
        path: routePaths.incorporation.capitalDetails,
        element: <CapitalDetails />,
      },
      {
        path: routePaths.incorporation.documentsKyc,
        element: <DocumentsKyc />,
      },
      {
        path: routePaths.incorporation.reviewApplication,
        element: <ReviewApplication />,
      },
      {
        path: routePaths.incorporation.submissionSuccess,
        element: <SubmissionSuccess />,
      },
      // Safe redirects for deprecated legacy steps
      {
        path: routePaths.incorporation.linkedRegistrations,
        element: <Navigate to={routePaths.incorporation.reviewApplication} replace />,
      },
      {
        path: routePaths.incorporation.feesPayment,
        element: <Navigate to={routePaths.incorporation.submissionSuccess} replace />,
      },
      {
        path: routePaths.incorporation.applicationTracking,
        element: <Navigate to={routePaths.applications} replace />,
      },
      {
        path: routePaths.incorporation.receipt,
        element: <Navigate to={routePaths.incorporation.submissionSuccess} replace />,
      },
    ],
  },
]
