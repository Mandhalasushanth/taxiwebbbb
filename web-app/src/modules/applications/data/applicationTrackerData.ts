import { userStorage } from '@core/storage/userStorage'
import { authStorage } from '@core/auth'
import type { RecentApplication, FinalizedCharges } from '@modules/dashboard/types/dashboard.types'

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
  chargesFinalized?: boolean
  finalizedCharges?: FinalizedCharges
  rawApplication?: RecentApplication
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
  paymentDate?: string
  transactionId?: string
  assignedCA?: string
  expectedCompletion?: string
  chargesFinalized?: boolean
  finalizedCharges?: FinalizedCharges
  rawApplication?: RecentApplication
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
    chargesFinalized: cfg.chargesFinalized,
    finalizedCharges: cfg.finalizedCharges,
    rawApplication: cfg.rawApplication,
    paymentSummary: {
      serviceFee: cfg.payment[0],
      govFees: cfg.payment[1],
      gst: cfg.payment[2],
      totalAmount: cfg.payment[3],
      transactionId: cfg.transactionId || `TXN-${appId.replace(/\D/g, '').slice(-6) || '91842'}`,
      paymentMethod: 'Online Payment / Pre-authorized',
      paymentDate: cfg.paymentDate || date,
      paymentStatus,
    },
  }
}

export function getApplicationTrackerData(id?: string): ApplicationTrackerData | null {
  const userApps = userStorage.getUserApplications()
  const cleanId = (id || '').trim().toLowerCase()

  // Match application by exact id or code first, then digits, or fall back to the latest user app if no specific ID provided
  const matched =
    userApps.find((a) => (a.id || '').toLowerCase() === cleanId || (a.code || '').toLowerCase() === cleanId) ||
    userApps.find((a) => {
      const aCode = (a.code || '').toLowerCase()
      const aDigits = aCode.replace(/\D/g, '')
      const cleanDigits = cleanId.replace(/\D/g, '')
      return Boolean(cleanDigits && cleanDigits.length >= 4 && aDigits === cleanDigits)
    }) ||
    (cleanId ? null : userApps[0] || null)

  const currentUser = authStorage.getUser()

  // If no application matches or localStorage is empty, provide default matching the exact user reference
  if (!matched) {
    const defaultAppId = cleanId ? cleanId.toUpperCase() : 'APP-PENDING'
    const defaultEntity = currentUser?.fullName || 'Applicant'
    const defaultDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())

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
  const entity = currentUser?.fullName || metaParts[0] || 'Applicant'
  const appId = matched.code || matched.id
  const date = (matched as { date?: string }).date || new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
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
        { label: 'Target GSTIN', value: (currentUser as { gstin?: string })?.gstin || 'Pending Verification', isHighlight: true },
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
    const isChargesFinalized = Boolean(matched.chargesFinalized && matched.finalizedCharges)
    const ch = matched.finalizedCharges
    const currentPaymentStatus = matched.paymentStatus || (isChargesFinalized ? 'Pending' : 'Charges Pending')

    const assignedCA = 'Sneha Kulkarni (Senior CA)'
    const expectedCompletion = '18 Oct 2026'

    let paymentValues: [string, string, string, string]
    let paymentDate = date
    const paymentStatus = currentPaymentStatus

    if (isChargesFinalized && ch) {
      paymentValues = [
        `₹${ch.serviceFee.toLocaleString('en-IN')}`,
        ch.govFees > 0 ? `₹${ch.govFees.toLocaleString('en-IN')}` : '₹0 (Included)',
        `₹${ch.gst.toLocaleString('en-IN')}`,
        `₹${ch.total.toLocaleString('en-IN')}`,
      ]
      if (ch.finalizedAt) {
        try {
          const d = new Date(ch.finalizedAt)
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
          paymentDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
        } catch {
          paymentDate = date
        }
      }
    } else {
      paymentValues = [
        'Pending CA Review',
        'Pending confirmation',
        'Calculated upon finalization',
        'Charges Pending',
      ]
    }

    let steps: Array<[string, string, 'completed' | 'current' | 'pending', string?]>
    if (currentPaymentStatus === 'Paid') {
      steps = [
        ['Application Submitted', 'TDS refund details & documents received', 'completed', 'Today'],
        ['CA Verification', 'Senior CA verified Form 26AS & AIS deductions', 'completed', 'Today'],
        ['Manager Charge Finalization', `Charges finalized (${ch?.finalizedBy || 'Manager'})`, 'completed', 'Today'],
        ['Fee Payment Confirmed', `Paid ₹${ch?.total?.toLocaleString('en-IN') || ''} via Online Gateway`, 'completed', 'Today'],
        ['CPC Return Filing', 'Uploading verified claim to IT Department CPC', 'current', 'Today'],
        ['Direct Bank Credit', 'Direct credit to pre-validated bank account', 'pending'],
      ]
    } else if (isChargesFinalized) {
      steps = [
        ['Application Submitted', 'TDS refund details & documents received', 'completed', 'Today'],
        ['CA Verification', 'Senior CA verified Form 26AS & AIS deductions', 'completed', 'Today'],
        ['Manager Charge Finalization', `Charges finalized (${ch?.finalizedBy || 'Manager'})`, 'completed', 'Today'],
        ['Payment Due', `Payable balance: ₹${ch?.total?.toLocaleString('en-IN') || ''}`, 'current', 'Today'],
        ['CPC Return Filing', 'Uploading verified claim to IT Department CPC', 'pending'],
        ['Direct Bank Credit', 'Direct credit to pre-validated bank account', 'pending'],
      ]
    } else {
      steps = [
        ['Application Submitted', 'TDS refund details & documents received', 'completed', 'Today'],
        ['CA Verification', 'Senior CA cross-examining 26AS, AIS & deduction proof', 'current', 'Today'],
        ['Manager Charge Finalization', 'Assessing service charges based on return complexity', 'pending'],
        ['Fee Payment', 'Payment of finalized charges in Payment tab', 'pending'],
        ['CPC Return Filing', 'Uploading verified claim to IT Department CPC', 'pending'],
        ['Direct Bank Credit', 'Direct credit to pre-validated bank account', 'pending'],
      ]
    }

    const stageTitle = isChargesFinalized
      ? (currentPaymentStatus === 'Paid' ? 'Processing with Income Tax Dept' : 'Charges Finalized — Payment Due')
      : (matched.statusLabel || 'Under CA Review & Assessment')

    return buildTracker(appId, entity, date, {
      title: matched.title,
      category: 'ITR',
      stageTitle,
      filingHeader: 'TDS Refund Details',
      assignedCA,
      expectedCompletion,
      paymentStatus,
      paymentDate,
      transactionId: matched.transactionId,
      chargesFinalized: isChargesFinalized,
      finalizedCharges: ch,
      rawApplication: matched,
      filingFields: [
        { label: 'Taxpayer Name', value: entity },
        { label: 'PAN', value: pan, isHighlight: true },
        { label: 'Application Ref', value: appId },
        { label: 'Estimated Refund Claim', value: refundClaim, isHighlight: true },
        { label: 'Review Stage', value: isChargesFinalized ? (currentPaymentStatus === 'Paid' ? 'Filing with CPC' : 'Payment Due') : 'Under CA Review' },
        { label: 'Payment Status', value: paymentStatus, isHighlight: true },
      ],
      steps,
      docs: [
        ['d1', 'Form 26AS Tax Credit Statement', 'uploaded'],
        ['d2', 'Pre-Validated Refund Bank Details', 'uploaded'],
        ['d3', 'Salary / Deduction Certificates', 'uploaded'],
      ],
      payment: paymentValues,
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
