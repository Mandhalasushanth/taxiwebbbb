/**
 * Public surface of the GST module. Other modules import from here only.
 */
export { gstRoutes } from './routes'
export { GSTAmendmentSubmitted } from './components/GSTAmendment'
export {
  GSTCertificateForm,
  GSTCertificateSubmitted,
} from './components/GSTCertificate'
export { useGstReturns } from './hooks/useGstReturns'
export { gstService } from './services/gstService'
export type {
  GstApplication,
  GstReturn,
  GstReturnType,
  GstAmendmentPayload,
  GstAmendmentRecord,
  GstAmendmentFieldKey,
  GstCertificatePayload,
  GstCertificateRecord,
} from './types/gst.types'
