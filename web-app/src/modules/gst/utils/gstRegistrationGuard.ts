import type { DocumentItem } from '@modules/gst/types/gstDocuments.types'
import type { GstBusinessFormData } from '@modules/gst/types/gstBusiness.types'
import { validateGstBusinessForm } from '@modules/gst/validation/gstStepBusiness.validator'

/** Wizard steps: 1 Business · 2 Documents · 3 Review · 4 Status (after submission) */
export const GST_REGISTRATION_STEPS = { business: 1, documents: 2, review: 3, status: 4 } as const

/** Why the Documents step is incomplete, or null when every document is ready */
export const getDocumentsStepError = (documents: DocumentItem[]): string | null => {
  const addressDoc = documents.find((d) => d.id === 'address_proof')
  if (addressDoc && !addressDoc.addressProofType) {
    return 'Please choose address type for Principal Place Address Proof.'
  }
  const pendingDocs = documents.filter((d) => !d.isUploaded)
  return pendingDocs.length > 0
    ? `Please upload all required documents (${pendingDocs.map((d) => d.title).join(', ')}) before proceeding.`
    : null
}

export interface RegistrationProgress {
  businessData: GstBusinessFormData
  documents: DocumentItem[]
  /** True when the application has been submitted from the Review step */
  isSubmitted?: boolean
  /** Backward compatibility with payment verification flag */
  isPaid?: boolean
}

/**
 * Highest step the user may open right now (the first step whose prerequisites are not met).
 * Direct URLs such as ?step=status are clamped to this.
 */
export const getMaxAllowedStep = ({ businessData, documents, isSubmitted, isPaid }: RegistrationProgress): number => {
  if (Object.keys(validateGstBusinessForm(businessData)).length > 0) return GST_REGISTRATION_STEPS.business
  if (getDocumentsStepError(documents)) return GST_REGISTRATION_STEPS.documents
  return (isSubmitted || isPaid) ? GST_REGISTRATION_STEPS.status : GST_REGISTRATION_STEPS.review
}

/** Requested step, or the first pending step when its prerequisites are missing */
export const clampRegistrationStep = (requested: number, progress: RegistrationProgress): number =>
  Math.max(GST_REGISTRATION_STEPS.business, Math.min(requested, getMaxAllowedStep(progress)))
