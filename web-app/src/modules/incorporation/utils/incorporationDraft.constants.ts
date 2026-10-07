import { routePaths } from '@core/config'

export const INCORPORATION_SERVICE_ID = 'incorporation'
export const INCORPORATION_SERVICE_TITLE = 'Company Incorporation'
/** Auto-save storage namespace (taxedge_incorporation_draft_<user>_incorporation) */
export const INCORPORATION_DRAFT_NAMESPACE = 'incorporation'

/** Wizard steps in order; moving between them never asks to save */
export const INCORPORATION_WIZARD_ROUTES: readonly string[] = [
  routePaths.incorporation.selectType,
  routePaths.incorporation.companyDetails,
  routePaths.incorporation.registeredOffice,
  routePaths.incorporation.promoterDetails,
  routePaths.incorporation.capitalDetails,
  routePaths.incorporation.documentsKyc,
  routePaths.incorporation.linkedRegistrations,
  routePaths.incorporation.reviewApplication,
  routePaths.incorporation.feesPayment,
]

/** Pages after payment that still belong to the flow */
const INCORPORATION_DONE_ROUTES: readonly string[] = [
  routePaths.incorporation.submissionSuccess,
  routePaths.incorporation.applicationTracking,
  routePaths.incorporation.receipt,
]

export const INCORPORATION_STEP_LABELS: readonly string[] = [
  'Company Type',
  'Company Details',
  'Registered Office',
  'Promoter Details',
  'Capital Details',
  'Documents & KYC',
  'Linked Registrations',
  'Review Application',
  'Fees Payment',
]

export const isIncorporationWizardRoute = (pathname: string): boolean =>
  INCORPORATION_WIZARD_ROUTES.includes(pathname)

export const isIncorporationFlowRoute = (pathname: string): boolean =>
  isIncorporationWizardRoute(pathname) || INCORPORATION_DONE_ROUTES.includes(pathname)

/** 1-based step number of a wizard route (1 when the route is not a wizard step) */
export const incorporationStepFor = (pathname: string): number =>
  Math.max(INCORPORATION_WIZARD_ROUTES.indexOf(pathname) + 1, 1)
