import { userStorage } from '@core/storage/userStorage'
import { authStorage } from '@core/auth'

export interface ApplicationInfoField {
  label: string
  value: string
  isHighlight?: boolean
}

export interface TimelineStep {
  stepNumber: number
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  timestamp?: string
}

export interface RequiredDocument {
  id: string
  name: string
  fileHash?: string
  status: 'uploaded' | 'pending'
}

export interface PaymentSummaryData {
  serviceFee: string
  govFees: string
  gst: string
  transactionId: string
  paymentMethod: string
  paymentDate: string
  totalAmount: string
  paymentStatus: string
}

export interface ApplicationTrackerData {
  appId: string
  title: string
  category: 'GST' | 'ITR' | 'Loans' | 'Business' | 'Insurance'
  customerEntity: string
  appliedDate: string
  assignedCA: string
  expectedCompletion: string
  currentStageTitle: string
  currentStageSubtitle: string
  infoFields: ApplicationInfoField[]
  filingFieldsHeader: string
  filingFields: ApplicationInfoField[]
  timelineSteps: TimelineStep[]
  documents: RequiredDocument[]
  documentsUploadedCount: number
  totalDocumentsCount: number
  paymentSummary: PaymentSummaryData
}

interface TrackerConfig {
  title: string
  category: 'GST' | 'ITR' | 'Loans' | 'Business' | 'Insurance'
  stageTitle: string
  filingHeader: string
  filingFields: ApplicationInfoField[]
  steps: Array<[string, string, 'completed' | 'current' | 'pending', string?]>
  docs: Array<[string, string, 'uploaded' | 'pending', string?]>
  payment: [string, string, string, string] // serviceFee, govFees, gst, total
  paymentStatus?: string
  assignedCA?: string
  expectedCompletion?: string
}

function buildTracker(
  appId: string,
  entity: string,
  date: string,
  cfg: TrackerConfig
): ApplicationTrackerData {
  const documents: RequiredDocument[] = cfg.docs.map(([id, name, status, fileHash]) => ({
    id,
    name,
    status,
    ...(fileHash ? { fileHash } : {}),
  }))

  const timelineSteps: TimelineStep[] = cfg.steps.map(([title, desc, status, time], idx) => ({
    stepNumber: idx + 1,
    title,
    description: desc,
    status,
    ...(time ? { timestamp: time } : {}),
  }))

  const assignedCA = cfg.assignedCA || 'CA not assigned yet'
  const expectedCompletion = cfg.expectedCompletion || '15 Oct 2026'
  const paymentStatus = cfg.paymentStatus || 'Pending'

  return {
    appId,
    title: cfg.title,
    category: cfg.category,
    customerEntity: entity,
    appliedDate: date,
    assignedCA,
    expectedCompletion,
    currentStageTitle: cfg.stageTitle,
    currentStageSubtitle: `Assigned CA: ${assignedCA} · Target: ${expectedCompletion}`,
    infoFields: [
      { label: 'Customer / Entity', value: entity },
      { label: 'Service', value: cfg.title },
      { label: 'Application ID', value: appId, isHighlight: true },
      { label: 'Applied Date', value: date },
      { label: 'Assigned CA', value: assignedCA },
      { label: 'Expected Completion', value: expectedCompletion },
    ],
    filingFieldsHeader: cfg.filingHeader,
    filingFields: cfg.filingFields,
    timelineSteps,
    documents,
    documentsUploadedCount: documents.filter((d) => d.status === 'uploaded').length,
    totalDocumentsCount: documents.length,
    paymentSummary: {
      serviceFee: cfg.payment[0],
      govFees: cfg.payment[1],
      gst: cfg.payment[2],
      totalAmount: cfg.payment[3],
      transactionId: `TXN-${appId.replace(/\D/g, '').slice(-6) || '91842'}`,
      paymentMethod: 'Online Payment / Pre-authorized',
      paymentDate: date,
      paymentStatus,
    },
  }
}

export function getApplicationTrackerData(id?: string): ApplicationTrackerData | null {
  const userApps = userStorage.getUserApplications()
  const cleanId = (id || '').trim().toLowerCase()

  // Match application by exact id, code, or digits, or fall back to the latest user app if no specific ID provided
  const matched = userApps.find((a) => {
    const aId = (a.id || '').toLowerCase()
    const aCode = (a.code || '').toLowerCase()
    const aDigits = aCode.replace(/\D/g, '')
    const cleanDigits = cleanId.replace(/\D/g, '')
    return aId === cleanId || aCode === cleanId || (cleanDigits && aDigits === cleanDigits)
  }) || (cleanId ? null : userApps[0] || null)

  const currentUser = authStorage.getUser()

  // If no application matches or localStorage is empty, provide default matching the exact user reference
  if (!matched) {
    const defaultAppId = cleanId ? cleanId.toUpperCase() : 'ITR-2026-91842'
    const defaultEntity = currentUser?.fullName || 'Sagarika'
    const defaultDate = '13 Oct 2026'

    return buildTracker(defaultAppId, defaultEntity, defaultDate, {
      title: 'ITR Filing - ITR-1 (Sahaj) - Salary & Other Income',
      category: 'ITR',
      stageTitle: 'Document Verification',
      filingHeader: 'Income Tax Return Details',
      assignedCA: 'CA not assigned yet',
      expectedCompletion: '15 Oct 2026',
      paymentStatus: 'Pending',
      filingFields: [
        { label: 'Customer / Entity', value: defaultEntity },
        { label: 'Service', value: 'ITR Filing - ITR-1 (Sahaj) - Salary & Other Income' },
        { label: 'Application ID', value: defaultAppId, isHighlight: true },
        { label: 'Applied Date', value: defaultDate },
        { label: 'Assigned CA', value: 'CA not assigned yet' },
        { label: 'Expected Completion', value: '15 Oct 2026' },
      ],
      steps: [
        ['Application Submitted', 'Return information & documents received', 'completed', 'Today'],
        ['Staff Verification', 'Tax Executive verifying documents & Form 26AS/AIS', 'current', 'Today'],
        ['ITR Preparation & Tax Calculation', 'Tax computation & dual-regime optimization', 'pending'],
        ['Internal Tax Review', 'Senior CA verification & quality audit', 'pending'],
        ['Customer Review & Approval', 'Customer signs off on final computation', 'pending'],
        ['ITR Submission', 'Filing return with Income Tax e-Filing portal', 'pending'],
        ['E-Verification', 'Aadhaar OTP / EVC verification pending', 'pending'],
        ['Income Tax Department Processing', 'Central Processing Center (CPC) return processing & refund/tax closure', 'pending'],
      ],
      docs: [
        ['d1', 'Home Loan Interest Certificate (Sec 24b)', 'uploaded', '5516bb0b-315e-4e52-b398-bd92a2e1c01e'],
      ],
      payment: ['₹847', '₹0 (Included)', '₹152', '₹999'],
    })
  }

  const metaParts = (matched.meta || '').split('·').map((s) => s.trim())
  const entity = currentUser?.fullName || metaParts[0] || 'Sagarika'
  const appId = matched.code || matched.id
  const date = (matched as { date?: string }).date || '13 Oct 2026'
  const key = (matched.title || appId).toLowerCase()
  const pan = currentUser?.pan ? currentUser.pan.toUpperCase() : 'Submitted in Application'

  // 1. GST Amendment
  if (key.includes('amendment')) {
    return buildTracker(appId, entity, date, {
      title: 'GST Amendment',
      category: 'GST',
      stageTitle: matched.statusLabel || 'Verification & Processing in Progress',
      filingHeader: 'GST Amendment Request Details',
      filingFields: [
        { label: 'Business Entity', value: entity },
        { label: 'Target GSTIN', value: (currentUser as { gstin?: string })?.gstin || '29AAAAA0000A1Z5', isHighlight: true },
        { label: 'Application ARN', value: appId, isHighlight: true },
        { label: 'Amended Section', value: metaParts[0] || 'Core Field' },
        { label: 'Jurisdiction', value: currentUser?.state || 'India' },
        { label: 'Status', value: matched.statusLabel || 'Submitted', isHighlight: true },
      ],
      steps: [
        ['Amendment Request Submitted', 'Application received with uploaded proof', 'completed', 'Today'],
        ['Officer Verification', 'Verification of requested modifications', 'current', 'Today'],
        ['Portal Endorsement', 'Updating records on GST portal', 'pending'],
        ['Amended Certificate Issued', 'Updated GST registration certificate generated', 'pending'],
      ],
      docs: [
        ['d1', 'Supporting Proof Document', 'uploaded'],
        ['d2', 'Identity & Authorization Proof', 'uploaded'],
      ],
      payment: ['Service Fee', '₹0', 'Included', 'Paid'],
    })
  }

  // 2. GST Registration & Filing
  if (key.includes('gst')) {
    const isRegistration = key.includes('registration')
    return buildTracker(appId, entity, date, {
      title: matched.title,
      category: 'GST',
      stageTitle: matched.statusLabel || 'Document Verification in Progress',
      filingHeader: isRegistration ? 'Registration Filing Details' : 'GST Return Details',
      filingFields: [
        { label: 'Legal Name', value: entity },
        { label: 'PAN', value: pan, isHighlight: true },
        { label: 'Application Ref', value: appId },
        { label: 'Service Name', value: matched.title },
        { label: 'Jurisdiction', value: currentUser?.state || metaParts[1] || 'India' },
        { label: 'Filing Status', value: matched.statusLabel || 'Submitted', isHighlight: true },
      ],
      steps: [
        ['Customer Request', 'Application submitted by user', 'completed', 'Today'],
        ['Staff Verification', 'Checking details and uploaded documents', 'current', 'Today'],
        ['Application Drafting', 'Preparing portal filing dossier', 'pending'],
        ['E-Sign / OTP Authentication', 'Applicant authorization check', 'pending'],
        ['Portal E-Filing', 'Submission to GSTN portal', 'pending'],
        ['Acknowledgement Issuance', 'Filing confirmation & ARN generated', 'pending'],
      ],
      docs: [
        ['d1', 'PAN Card & Identity Proof', 'uploaded'],
        ['d2', 'Business Premises Address Proof', 'uploaded'],
        ['d3', 'Bank Account Verification Proof', 'pending'],
      ],
      payment: ['Paid with Filing', '₹0', 'Included', 'Paid'],
    })
  }

  // 3. ITR Filing
  if (key.includes('itr') || key.includes('income tax')) {
    const title = matched.title.includes('ITR-1') || matched.title.includes('Sahaj')
      ? matched.title
      : 'ITR Filing - ITR-1 (Sahaj) - Salary & Other Income'

    return buildTracker(appId, entity, date, {
      title,
      category: 'ITR',
      stageTitle: 'Document Verification',
      assignedCA: 'CA not assigned yet',
      expectedCompletion: '15 Oct 2026',
      paymentStatus: 'Pending',
      filingHeader: 'Income Tax Return Details',
      filingFields: [
        { label: 'Customer / Entity', value: entity },
        { label: 'Service', value: title },
        { label: 'Application ID', value: appId, isHighlight: true },
        { label: 'Applied Date', value: date },
        { label: 'Assigned CA', value: 'CA not assigned yet' },
        { label: 'Expected Completion', value: '15 Oct 2026' },
      ],
      steps: [
        ['Application Submitted', 'Return information & documents received', 'completed', 'Today'],
        ['Staff Verification', 'Tax Executive verifying documents & Form 26AS/AIS', 'current', 'Today'],
        ['ITR Preparation & Tax Calculation', 'Tax computation & dual-regime optimization', 'pending'],
        ['Internal Tax Review', 'Senior CA verification & quality audit', 'pending'],
        ['Customer Review & Approval', 'Customer signs off on final computation', 'pending'],
        ['ITR Submission', 'Filing return with Income Tax e-Filing portal', 'pending'],
        ['E-Verification', 'Aadhaar OTP / EVC verification pending', 'pending'],
        ['Income Tax Department Processing', 'Central Processing Center (CPC) return processing & refund/tax closure', 'pending'],
      ],
      docs: [
        ['d1', 'Home Loan Interest Certificate (Sec 24b)', 'uploaded', '5516bb0b-315e-4e52-b398-bd92a2e1c01e'],
      ],
      payment: ['₹847', '₹0 (Included)', '₹152', '₹999'],
    })
  }

  // 3. TDS Refund
  if (key.includes('tds') || key.includes('refund')) {
    const refundClaim = metaParts.find((p) => p.includes('₹')) || 'As Declared'
    return buildTracker(appId, entity, date, {
      title: matched.title,
      category: 'ITR',
      stageTitle: matched.statusLabel || 'TDS Reconciliation in Progress',
      filingHeader: 'TDS Refund Details',
      filingFields: [
        { label: 'Taxpayer Name', value: entity },
        { label: 'PAN', value: pan, isHighlight: true },
        { label: 'Application Ref', value: appId },
        { label: 'Estimated Refund Claim', value: refundClaim, isHighlight: true },
        { label: 'Current Status', value: matched.statusLabel || 'Submitted' },
      ],
      steps: [
        ['Refund Assessment', 'TDS claim registered in portal', 'completed', 'Today'],
        ['26AS Reconciliation', 'Matching deductions with ITD records', 'current', 'Today'],
        ['Rectification Drafting', 'Preparing revised refund filing', 'pending'],
        ['ITD Submission', 'Uploading verified claim to CPC', 'pending'],
        ['Direct Bank Credit', 'Direct bank deposit by Income Tax Dept', 'pending'],
      ],
      docs: [
        ['d1', 'Form 26AS Tax Credit Statement', 'uploaded'],
        ['d2', 'Pre-Validated Refund Bank Details', 'uploaded'],
        ['d3', 'Salary / Deduction Certificates', 'pending'],
      ],
      payment: ['Paid with Application', '₹0', 'Included', 'Paid'],
    })
  }

  // 4. Other Services (Loans, Business, Insurance)
  return buildTracker(appId, entity, date, {
    title: matched.title,
    category: (matched.title.toLowerCase().includes('loan')
      ? 'Loans'
      : matched.title.toLowerCase().includes('insurance')
      ? 'Insurance'
      : 'Business') as ApplicationTrackerData['category'],
    stageTitle: matched.statusLabel || 'Application Processing',
    filingHeader: 'Application Details',
    filingFields: [
      { label: 'Applicant / Entity', value: entity },
      { label: 'PAN', value: pan, isHighlight: true },
      { label: 'Application Ref', value: appId },
      { label: 'Service Description', value: matched.title },
      { label: 'Status', value: matched.statusLabel || 'Submitted', isHighlight: true },
    ],
    steps: [
      ['Application Logged', 'Service request initiated', 'completed', 'Today'],
      ['Document & Profile Review', 'Specialist reviewing submission', 'current', 'Today'],
      ['Processing & Approval', 'Partner coordination and filing', 'pending'],
      ['Final Dispatch / Issuance', 'Final confirmation delivery', 'pending'],
    ],
    docs: [
      ['d1', 'Applicant KYC & Identification', 'uploaded'],
      ['d2', 'Financial Statements / Supporting Proofs', 'uploaded'],
    ],
    payment: ['Paid with Application', '₹0', 'Included', 'Paid'],
  })
}
