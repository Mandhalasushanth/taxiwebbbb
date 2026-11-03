import { routePaths } from '@core/config'

export interface DraftRouteTarget {
  serviceId?: string
  resumeRoute?: string
  id?: string
  reference?: string
  status?: string
  statusLabel?: string
}

/**
 * Checks whether an item or reference represents an unsubmitted draft application.
 */
export function isDraftApplication(
  item: DraftRouteTarget | null | undefined
): boolean {
  if (!item) return false
  const statusUpper = (item.status || '').toUpperCase()
  const labelLower = (item.statusLabel || '').toLowerCase()
  const idLower = (item.id || '').toLowerCase()
  const refLower = (item.reference || '').toLowerCase()

  return (
    statusUpper === 'DRAFT' ||
    labelLower === 'draft' ||
    idLower.startsWith('draft-') ||
    refLower.startsWith('draft-') ||
    idLower.includes('draft')
  )
}

/**
 * Resolves the destination service home page for a draft based on its serviceId, reference, or resumeRoute.
 */
export function resolveDraftResumeRoute(
  input: string | DraftRouteTarget
): string {
  if (typeof input !== 'string') {
    if (input.resumeRoute && input.resumeRoute.trim() !== '') {
      return input.resumeRoute
    }
    input = input.serviceId || input.reference || input.id || ''
  }

  const clean = input
    .toLowerCase()
    .replace(/^draft-/, '')
    .trim()

  // ITR services (check ITR before general keywords like 'filing')
  if (clean.includes('itr') || clean.startsWith('itr')) {
    if (clean.includes('revised')) {
      return routePaths.itr.revisedItr
    }
    if (clean.includes('tds') || clean.includes('refund')) {
      return routePaths.itr.tdsRefund
    }
    if (clean.includes('notice')) {
      return routePaths.itr.taxNoticeAssistance
    }
    return routePaths.itr.itrFiling
  }

  // GST services
  if (clean.includes('registration')) {
    return routePaths.gst.registration
  }
  if (clean.includes('amendment')) {
    return routePaths.gst.amendment
  }
  if (clean.includes('compliance')) {
    return routePaths.gst.compliance
  }
  if (clean.includes('cancellation')) {
    return routePaths.gst.cancellation
  }
  if (clean.includes('certificate')) {
    return routePaths.gst.certificate
  }
  if (clean.includes('gst-return') || clean.includes('returns')) {
    return routePaths.gst.returns
  }
  if (
    clean.includes('filing') ||
    clean.includes('file-period') ||
    clean.includes('file-upload') ||
    clean.startsWith('gst')
  ) {
    return routePaths.gst.filing
  }

  // Incorporation
  if (clean.includes('incorporation') || clean.includes('company')) {
    return routePaths.incorporation.companyDetails
  }

  // Loans
  if (clean.includes('personal-loan') || clean.includes('personal')) {
    return routePaths.loansPersonalLoan
  }
  if (clean.includes('home-loan') || clean.includes('home')) {
    return routePaths.loansHomeLoan
  }
  if (clean.includes('business') || clean.includes('working-capital')) {
    return routePaths.loansBusinessWorkingCapital
  }
  if (clean.includes('property')) {
    return routePaths.loansPropertyLoan
  }
  if (clean.includes('vehicle')) {
    return routePaths.loansVehicleLoan
  }
  if (clean.includes('machinery')) {
    return routePaths.loansMachineryLoan
  }
  if (clean.includes('msme')) {
    return routePaths.loansMsmeLoan
  }
  if (clean.includes('project')) {
    return routePaths.loansProjectFinance
  }
  if (clean.includes('loan')) {
    return routePaths.loans
  }

  return routePaths.dashboard
}
