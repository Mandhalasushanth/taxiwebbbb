import { routePaths } from '@core/config'

export const INCORPORATION_SERVICE_ID = 'incorporation'
export const INCORPORATION_SERVICE_TITLE = 'Company Incorporation'

/** Form steps where application data is entered (starts at Step 1: Company Details) */
export const INCORPORATION_FORM_ROUTES: readonly string[] = [
  routePaths.incorporation.companyDetails,
  routePaths.incorporation.registeredOffice,
  routePaths.incorporation.promoterDetails,
  routePaths.incorporation.capitalDetails,
  routePaths.incorporation.documentsKyc,
  routePaths.incorporation.linkedRegistrations,
  routePaths.incorporation.reviewApplication,
  routePaths.incorporation.feesPayment,
]

/** Full wizard routes list including the initial selection screen */
export const INCORPORATION_WIZARD_ROUTES: readonly string[] = [
  routePaths.incorporation.selectType,
  ...INCORPORATION_FORM_ROUTES,
]

/** Pages after payment that still belong to the flow */
const INCORPORATION_DONE_ROUTES: readonly string[] = [
  routePaths.incorporation.submissionSuccess,
  routePaths.incorporation.applicationTracking,
  routePaths.incorporation.receipt,
]

export const INCORPORATION_STEP_LABELS: readonly string[] = [
  'Company Details',
  'Registered Office',
  'Promoter Details',
  'Capital Details',
  'Documents & KYC',
  'Linked Registrations',
  'Review Application',
  'Fees Payment',
]

/** True when the pathname is an active form step where fields are entered */
export const isIncorporationFormRoute = (pathname: string): boolean =>
  INCORPORATION_FORM_ROUTES.includes(pathname)

export const isIncorporationWizardRoute = (pathname: string): boolean =>
  INCORPORATION_WIZARD_ROUTES.includes(pathname)

/** Internal routes between form steps; navigating back to selectType from a form step requires draft prompt if fields were added */
export const isIncorporationInternalFlowRoute = (pathname: string): boolean =>
  isIncorporationFormRoute(pathname) || INCORPORATION_DONE_ROUTES.includes(pathname)

export const isIncorporationFlowRoute = (pathname: string): boolean =>
  isIncorporationInternalFlowRoute(pathname)

/** 1-based step number among form routes (1: Company Details, 2: Registered Office, etc.) */
export const incorporationStepFor = (pathname: string): number =>
  Math.max(INCORPORATION_FORM_ROUTES.indexOf(pathname) + 1, 1)
