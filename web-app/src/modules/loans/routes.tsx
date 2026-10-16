import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { routePaths } from '@core/config'

const LoanMarketplace = lazy(() => import('./components/LoanMarketplace/LoanMarketplace'))
const Loans = lazy(() => import('./components/Loans/Loans'))
const HomeLoan = lazy(() => import('./components/HomeLoan/HomeLoan'))
const PersonalLoan = lazy(() => import('./components/PersonalLoan/PersonalLoan'))
const PropertyLoan = lazy(() => import('./components/PropertyLoan/PropertyLoan'))
const VehicleLoan = lazy(() => import('./components/VehicleLoan/VehicleLoan'))
const BusinessWorkingCapital = lazy(() => import('./components/BusinessWorkingCapital/BusinessWorkingCapital'))
const MachineryLoan = lazy(() => import('./components/MachineryLoan/MachineryLoan'))
const MsmeLoan = lazy(() => import('./components/MsmeLoan/MsmeLoan'))
const ProjectFinance = lazy(() => import('./components/ProjectFinance/ProjectFinance'))
const LoanApplicationStatus = lazy(() => import('./shared/LoanApplicationStatus/LoanApplicationStatus'))

/** Old Business Loan / Working Capital links (bookmarks, saved drafts) open the combined flow */
const toBusinessWorkingCapital = <Navigate to={routePaths.loansBusinessWorkingCapital} replace />

export const loansRoutes: RouteObject[] = [
  { path: routePaths.loans, element: <LoanMarketplace /> },
  { path: '/loans/all', element: <Loans /> },
  { path: routePaths.loansHomeLoan, element: <HomeLoan /> },
  { path: routePaths.loansPersonalLoan, element: <PersonalLoan /> },
  { path: routePaths.loansPropertyLoan, element: <PropertyLoan /> },
  { path: routePaths.loansVehicleLoan, element: <VehicleLoan /> },
  { path: routePaths.loansBusinessWorkingCapital, element: <BusinessWorkingCapital /> },
  { path: routePaths.legacyLoans.businessLoan, element: toBusinessWorkingCapital },
  { path: routePaths.legacyLoans.workingCapitalLoan, element: toBusinessWorkingCapital },
  { path: routePaths.loansMachineryLoan, element: <MachineryLoan /> },
  { path: routePaths.loansMsmeLoan, element: <MsmeLoan /> },
  { path: routePaths.loansProjectFinance, element: <ProjectFinance /> },
  { path: '/loans/status/:id', element: <LoanApplicationStatus /> },
  { path: '/loans/status', element: <LoanApplicationStatus /> },
]

export default loansRoutes
