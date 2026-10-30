export type StatusCategory =
  | 'ALL'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'UNDER_VERIFICATION'
  | 'SUBMITTED'
  | 'PENDING_DOCUMENTS'
  | 'REJECTED'
  | 'APPROVED'

export type NormalizedStatus = StatusCategory | 'DRAFT' | 'OTHER'

const COMPLETED_KEYWORDS = [
  'complete',
  'approved',
  'disbursed',
  'sanctioned',
  'certificate issued',
  'documents issued',
  'policy issued',
  'closed',
  'return filed',
  'e-verified',
  'e verified',
  'everified',
] as const

const VERIFICATION_KEYWORDS = [
  'under verification',
  'under review',
  'under scrutiny',
  'officer review',
  'officer scrutiny',
  'internal tax review',
  'ca review',
  'documents under verification',
  'verification',
  'scrutiny',
  'underwriting',
] as const

const SUBMITTED_KEYWORDS = [
  'submitted',
  'new request',
  'application received',
  'application submitted',
] as const

const IN_PROGRESS_KEYWORDS = [
  'in progress',
  'progress',
  'processing',
  'document collection',
  'pending payment',
  'payment pending',
  'documents pending',
  'ready for filing',
  'return preparation',
  'data preparation',
  'customer approval',
  'customer review',
  'draft',
  'pending',
] as const

export function normalizeApplicationStatus(
  status?: string,
  statusLabel?: string
): NormalizedStatus {
  const combined = `${status || ''} ${statusLabel || ''}`.trim()
  if (!combined) {
    return 'OTHER'
  }
  const s = combined.toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ')
  if (!s) {
    return 'OTHER'
  }

  // Terminal non-success statuses
  if (
    s.includes('reject') ||
    s.includes('fail') ||
    s.includes('cancel') ||
    s.includes('suspend')
  ) {
    return 'OTHER'
  }

  if (COMPLETED_KEYWORDS.some((kw) => s.includes(kw))) {
    return 'COMPLETED'
  }

  if (
    !s.includes('customer review') &&
    (s === 'review' || VERIFICATION_KEYWORDS.some((kw) => s.includes(kw)))
  ) {
    return 'UNDER_VERIFICATION'
  }

  if (SUBMITTED_KEYWORDS.some((kw) => s.includes(kw))) {
    return 'SUBMITTED'
  }

  if (IN_PROGRESS_KEYWORDS.some((kw) => s.includes(kw))) {
    return 'IN_PROGRESS'
  }

  return 'OTHER'
}

export function matchesStatusFilter(
  status: string | undefined,
  filter: string,
  statusLabel?: string
): boolean {
  if (filter === 'ALL') {
    return true
  }
  const normFilter = String(filter).toUpperCase().replace(/[\s-]+/g, '_')

  if (normFilter === 'UNDER_VERIFICATION') {
    return normalizeApplicationStatus(status, statusLabel) === 'UNDER_VERIFICATION'
  }

  if (normFilter === 'COMPLETED') {
    return normalizeApplicationStatus(status, statusLabel) === 'COMPLETED'
  }

  if (normFilter === 'APPROVED') {
    const s = `${status || ''} ${statusLabel || ''}`.trim().toLowerCase()
    return s.includes('approv') || s.includes('sanction')
  }

  if (normFilter === 'SUBMITTED') {
    return normalizeApplicationStatus(status, statusLabel) === 'SUBMITTED'
  }

  if (normFilter === 'PENDING_DOCUMENTS' || normFilter === 'DOCUMENTS_PENDING') {
    const s = `${status || ''} ${statusLabel || ''}`.trim().toLowerCase().replace(/_/g, ' ')
    return (
      s.includes('pending doc') ||
      s.includes('doc pending') ||
      s.includes('documents pending') ||
      s.includes('pending documents') ||
      s.includes('document collection') ||
      s.includes('kyc pending')
    )
  }

  if (normFilter === 'REJECTED') {
    const s = `${status || ''} ${statusLabel || ''}`.trim().toLowerCase()
    return (
      s.includes('reject') ||
      s.includes('fail') ||
      s.includes('cancel') ||
      s.includes('suspend')
    )
  }

  if (normFilter === 'IN_PROGRESS') {
    return normalizeApplicationStatus(status, statusLabel) === 'IN_PROGRESS'
  }

  return normalizeApplicationStatus(status, statusLabel) === normFilter
}
