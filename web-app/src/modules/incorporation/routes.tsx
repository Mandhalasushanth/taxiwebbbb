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
const LinkedRegistrations = lazy(() => import('./components/LinkedRegistrations/LinkedRegistrations'))
const ReviewApplication = lazy(() => import('./components/ReviewApplication/ReviewApplication'))
const FeesPayment = lazy(() => import('./components/FeesPayment/FeesPayment'))
const SubmissionSuccess = lazy(() => import('./components/SubmissionSuccess/SubmissionSuccess'))
const ApplicationTracking = lazy(() => import('./components/ApplicationTracking/ApplicationTracking'))
const ApplicationReceipt = lazy(() => import('./components/ApplicationReceipt/ApplicationReceipt'))


import { IncorporationWizardLayout } from './components'

export const incorporationRoutes: RouteObject[] = [
  {
    path: routePaths.incorporation.root,
    element: <Navigate to={routePaths.incorporation.selectType} replace />,
  },
  {
    element: <IncorporationWizardLayout />,
    children: [
      {
        path: routePaths.incorporation.selectType,
        element: <SelectCompanyType />,
      },
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
        path: routePaths.incorporation.linkedRegistrations,
        element: <LinkedRegistrations />,
      },
      {
        path: routePaths.incorporation.reviewApplication,
        element: <ReviewApplication />,
      },
      {
        path: routePaths.incorporation.feesPayment,
        element: <FeesPayment />,
      },
      {
        path: routePaths.incorporation.submissionSuccess,
        element: <SubmissionSuccess />,
      },
      {
        path: routePaths.incorporation.applicationTracking,
        element: <ApplicationTracking />,
      },
      {
        path: routePaths.incorporation.receipt,
        element: <ApplicationReceipt />,
      },
    ],
  },
]
