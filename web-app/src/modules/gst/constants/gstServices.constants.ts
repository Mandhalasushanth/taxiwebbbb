import { routePaths } from '@core/config'
import { formatRupees } from '@modules/gst/utils/gstFormat'
import { GST_FEES } from '@modules/gst/constants/gstBusiness.constants'

export type GstServiceType = 'registration' | 'filing' | 'compliance' | 'cancellation' | 'amendment' | 'certificate'

export interface GstService {
  id: string
  title: string
  description: string
  price: string
  priceType: string
  iconType: GstServiceType
  badge?: string
  turnaround?: string
}

/** Screen each dashboard service opens */
export const GST_SERVICE_ROUTES: Record<GstServiceType, string> = {
  registration: routePaths.gst.registration,
  filing: routePaths.gst.filing,
  compliance: routePaths.gst.compliance,
  amendment: routePaths.gst.amendment,
  cancellation: routePaths.gst.cancellation,
  certificate: routePaths.gst.certificate,
}

/** 3D icon image paths stored in public/assets/icons/gst/ */
export const GST_SERVICE_ICON_IMAGE_MAP: Partial<Record<GstServiceType, string>> = {
  registration: '/assets/icons/gst/gst-registration.png',
  filing: '/assets/icons/gst/gst-filing.png',
  compliance: '/assets/icons/gst/gst-compliance.png',
  amendment: '/assets/icons/gst/gst-amendment.png',
  cancellation: '/assets/icons/gst/gst-cancellation.png',
  certificate: '/assets/icons/gst/gst-certificate.png',
}

/** Service catalogue shown on the GST dashboard; prices come from GST_FEES */
export const GST_SERVICES: readonly GstService[] = [
  { id: '1', title: 'GST Registration', description: 'Register your business for GST', price: formatRupees(GST_FEES.registration), priceType: 'one time', iconType: 'registration', badge: 'Most Popular', turnaround: '3–5 days' },
  { id: '2', title: 'GST Filing', description: 'File monthly or quarterly returns', price: formatRupees(GST_FEES.filingCombo), priceType: 'per period', iconType: 'filing', badge: 'Periodic', turnaround: 'Same Day' },
  { id: '3', title: 'GST Compliance', description: 'Stay compliant with GST requirements', price: formatRupees(GST_FEES.compliance), priceType: 'per year', iconType: 'compliance', badge: 'Annual', turnaround: 'Comprehensive' },
  { id: '4', title: 'GST Amendment', description: 'Update your GST registration details', price: formatRupees(GST_FEES.amendment), priceType: 'per change', iconType: 'amendment', badge: 'Modification', turnaround: '24–48 hrs' },
  { id: '5', title: 'GST Cancellation', description: 'Cancel your GST registration', price: formatRupees(GST_FEES.cancellation), priceType: 'one time', iconType: 'cancellation', badge: 'Closure', turnaround: '5–7 days' },
  { id: '6', title: 'GST Certificate', description: 'Download your GST certificate', price: formatRupees(GST_FEES.certificate), priceType: 'per copy', iconType: 'certificate', badge: 'Official', turnaround: 'Instant' },
]
