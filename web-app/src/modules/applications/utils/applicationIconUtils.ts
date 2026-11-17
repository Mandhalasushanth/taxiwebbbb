export interface ServiceIconTarget {
  title?: string
  reference?: string
  code?: string
  category?: string
  id?: string
}

/**
 * Returns the exact 3D illustration icon path matching the mobile application.
 * All icons are stored in `/assets/icons/` and `/assets/images/services/`.
 */
export function getApplicationServiceIcon(item: ServiceIconTarget): string | null {
  const title = (item.title || '').toLowerCase()
  const ref = (item.reference || item.code || '').toLowerCase()
  const id = (item.id || '').toLowerCase()
  const category = (item.category || '').toLowerCase()
  const combined = `${title} ${ref} ${id} ${category}`

  // 1. ITR & Tax Services (Check specific ITR services before generic keywords)
  // TDS Refund Claim
  if (
    title.includes('tds') ||
    title.includes('refund') ||
    combined.includes('tds refund') ||
    combined.includes('tds-ref')
  ) {
    return '/assets/icons/itr/tds-refund.png'
  }

  // Revised ITR
  if (
    title.includes('revised') ||
    combined.includes('revised itr') ||
    combined.includes('revised-itr')
  ) {
    return '/assets/icons/itr/revised-itr.png'
  }

  // Previous Year / Belated ITR
  if (
    title.includes('previous year') ||
    title.includes('belated') ||
    combined.includes('previous-year')
  ) {
    return '/assets/icons/itr/previous-year-itr.png'
  }

  // Tax Notice Assistance
  if (
    title.includes('notice') ||
    combined.includes('tax notice') ||
    combined.includes('tax-notice')
  ) {
    return '/assets/icons/itr/tax-notice-assistance.png'
  }

  // General ITR Filing (e.g. "ITR Filing (AY 2026-2027)", "ITR Filing")
  if (
    title.includes('itr') ||
    combined.includes('itr filing') ||
    combined.includes('itr-fil') ||
    category === 'itr'
  ) {
    return '/assets/icons/itr/itr-filing.png'
  }

  // 2. GST Services
  // GST Registration
  if (
    combined.includes('gst registration') ||
    combined.includes('gst-reg') ||
    combined.includes('gst_reg') ||
    (title.includes('registration') && category === 'gst')
  ) {
    return '/assets/icons/gst/gst-registration.png'
  }

  // GST Filing (GSTR-1, GSTR_1, GSTR-3B, Nil, Annual, etc.)
  if (
    combined.includes('gst filing') ||
    combined.includes('gstr') ||
    combined.includes('gst-fil') ||
    combined.includes('gst_fil') ||
    (title.includes('filing') && category === 'gst')
  ) {
    return '/assets/icons/gst/gst-filing.png'
  }

  // GST Amendment
  if (
    title.includes('amendment') ||
    combined.includes('gst amendment') ||
    combined.includes('gst-amd')
  ) {
    return '/assets/icons/gst/gst-amendment.png'
  }

  // GST Cancellation / Revocation
  if (
    title.includes('cancellation') ||
    title.includes('revocation') ||
    combined.includes('gst cancellation') ||
    combined.includes('gst-can')
  ) {
    return '/assets/icons/gst/gst-cancellation.png'
  }

  // GST Certificate Download
  if (
    title.includes('certificate') ||
    combined.includes('reg-06') ||
    combined.includes('gst certificate') ||
    combined.includes('gst-cert')
  ) {
    return '/assets/icons/gst/gst-certificate.png'
  }

  // GST Compliance / Notice / Audit
  if (
    title.includes('compliance') ||
    combined.includes('gst compliance') ||
    combined.includes('gst-com')
  ) {
    return '/assets/icons/gst/gst-compliance.png'
  }

  // 3. Loans
  if (title.includes('personal') || combined.includes('personal-loan')) {
    return '/assets/icons/loans/personal-loan.png'
  }
  if (title.includes('home') || combined.includes('home-loan')) {
    return '/assets/icons/loans/home-loan.png'
  }
  if (
    title.includes('property') ||
    combined.includes('property-loan') ||
    title.includes('against property')
  ) {
    return '/assets/icons/loans/property-loan.png'
  }
  if (
    title.includes('vehicle') ||
    title.includes('auto') ||
    title.includes('car') ||
    combined.includes('vehicle-loan')
  ) {
    return '/assets/icons/loans/vehicle-loan.png'
  }
  if (
    title.includes('machinery') ||
    title.includes('equipment') ||
    combined.includes('machinery-loan')
  ) {
    return '/assets/icons/loans/machinery-loan.png'
  }
  if (title.includes('msme') || combined.includes('msme-loan')) {
    return '/assets/icons/loans/msme-loan.png'
  }
  if (title.includes('project') || combined.includes('project-finance')) {
    return '/assets/icons/loans/project-finance.png'
  }
  if (
    title.includes('working capital') ||
    title.includes('business loan') ||
    combined.includes('business-loan') ||
    (category === 'loans' && title.includes('business'))
  ) {
    return '/assets/icons/loans/business-loan.png'
  }
  if (category === 'loans') {
    return '/assets/icons/loans/personal-loan.png'
  }

  // 4. Incorporation & Company Registration
  if (title.includes('llp') || combined.includes('limited liability')) {
    return '/assets/icons/incorporation/llp.png'
  }
  if (title.includes('opc') || combined.includes('one person')) {
    return '/assets/icons/incorporation/opc.png'
  }
  if (
    title.includes('section 8') ||
    title.includes('section-8') ||
    title.includes('ngo') ||
    title.includes('trust')
  ) {
    return '/assets/icons/incorporation/section-8.png'
  }
  if (title.includes('public limited') || combined.includes('public-ltd')) {
    return '/assets/icons/incorporation/public-ltd.png'
  }
  if (
    title.includes('pvt ltd') ||
    title.includes('private limited') ||
    title.includes('company') ||
    title.includes('incorporation') ||
    category === 'company registration'
  ) {
    return '/assets/icons/incorporation/pvt-ltd.png'
  }

  // 5. Business / Projects / Insurance
  if (category === 'insurance' || title.includes('insurance')) {
    return '/assets/images/services/icon-insurance.png'
  }
  if (category === 'business' || title.includes('business')) {
    return '/assets/images/services/icon-business.png'
  }

  // Fallbacks by category
  if (category === 'gst') return '/assets/icons/gst/gst-registration.png'
  if (category === 'itr') return '/assets/icons/itr/itr-filing.png'

  return null
}
