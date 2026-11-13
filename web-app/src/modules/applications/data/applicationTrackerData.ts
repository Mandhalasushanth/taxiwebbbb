import { userStorage } from '@core/storage/userStorage'
import { authStorage } from '@core/auth'
import { readServiceDraft } from '@shared/saveDraft'
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
  steps?: Array<[string, string, 'completed' | 'current' | 'pending', string?]>
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


export function getDefaultApplicationSteps(
  dateOrTimestamp?: string,
  currentStatus?: string
): Array<[string, string, 'completed' | 'current' | 'pending', string?]> {
  const ts = dateOrTimestamp || '3 Nov 2026, 11:36 am'
  const isCompleted = currentStatus === 'Completed' || currentStatus === 'Approved'
  const isPaid = currentStatus === 'Paid'
  const isInVerification = currentStatus === 'Verification' || currentStatus === 'In Verification' || currentStatus === 'Under Review'
  const isPaymentDue = currentStatus === 'Payment Due' || currentStatus === 'Payment'

  return [
    [
      'Application Submitted',
      `Application successfully submitted on ${ts}.`,
      'completed',
      ts,
    ],
    [
      'Document Collection',
      'Review of identity, premises and constitution proofs.',
      isCompleted || isPaid || isInVerification || isPaymentDue ? 'completed' : 'current',
    ],
    [
      'Verification',
      'TRN & ARN processing and tax officer scrutiny.',
      isCompleted || isPaid ? 'completed' : (isInVerification ? 'current' : 'pending'),
    ],
    [
      'Payment',
      'The CA manager will assign the amount after verification. Payment progress will appear in the Payments tab.',
      isCompleted || isPaid ? 'completed' : (isPaymentDue ? 'current' : 'pending'),
    ],
    [
      'Completed',
      'Processing continues after successful payment, according to the service workflow.',
      isCompleted ? 'completed' : (isPaid ? 'current' : 'pending'),
    ],
  ]
}

function buildTracker(
  appId: string,
  entity: string,
  date: string,
  cfg: TrackerConfig
): ApplicationTrackerData {
  const rawDocs = (cfg.rawApplication as any)?.documents as Array<{
    id?: string
    name: string
    fileName?: string
    meta?: string
    date?: string
    url?: string
    file?: File | Blob | null
    status?: 'uploaded' | 'pending'
  }> | undefined

  // Canonical documents defined by the application type configuration
  const canonicalDocs: RequiredDocument[] = cfg.docs.map(([id, name, defaultStatus, fileHash]) => {
    // Find matching uploaded document from user's rawDocs if available
    const matched = rawDocs?.find((rd) => {
      if (rd.id && rd.id === id) return true
      const rdName = (rd.name || '').toLowerCase()
      const n = name.toLowerCase()
      if (rdName === n) return true
      if (n.includes('pan') && rdName.includes('pan')) return true
      if (n.includes('aadhaar') && rdName.includes('aadhaar')) return true
      if ((n.includes('business registration') || n.includes('coi')) && (rdName.includes('business') || rdName.includes('coi'))) return true
      if ((n.includes('address') || n.includes('premises')) && (rdName.includes('address') || rdName.includes('premises'))) return true
      if ((n.includes('bank') || n.includes('cheque') || n.includes('passbook')) && (rdName.includes('bank') || rdName.includes('cheque') || rdName.includes('passbook'))) return true
      if (n.includes('photo') && rdName.includes('photo')) return true
      if (n.includes('sales') && rdName.includes('sales')) return true
      if (n.includes('purchase') && rdName.includes('purchase')) return true
      return false
    })

    return {
      id,
      name,
      status: matched?.status || defaultStatus,
      ...(matched?.url || fileHash ? { fileHash: matched?.url || fileHash } : {}),
    }
  })

  // Also include any extra user documents that were not part of canonicalDocs
  const extraDocs: RequiredDocument[] = []
  if (rawDocs && rawDocs.length > canonicalDocs.length) {
    rawDocs.forEach((rd, idx) => {
      const alreadyIncluded = canonicalDocs.some((cd) => cd.id === rd.id || cd.name.toLowerCase() === rd.name.toLowerCase())
      if (!alreadyIncluded) {
        extraDocs.push({
          id: rd.id || `extra-doc-${idx + 1}`,
          name: rd.name,
          status: rd.status || 'uploaded',
          ...(rd.url ? { fileHash: rd.url } : {}),
        })
      }
    })
  }

  const documents: RequiredDocument[] = canonicalDocs.length > 0 ? [...canonicalDocs, ...extraDocs] : (
    rawDocs && rawDocs.length > 0
      ? rawDocs.map((d, idx) => ({
          id: d.id || `doc-${idx + 1}`,
          name: d.name,
          status: d.status || 'uploaded',
          ...(d.url ? { fileHash: d.url } : {}),
        }))
      : []
  )

  const defaultSteps = getDefaultApplicationSteps(date, cfg.rawApplication?.statusLabel || cfg.stageTitle)
  const rawSteps = (cfg.rawApplication as any)?.steps as Array<[string, string, 'completed' | 'current' | 'pending', string?]> | undefined
  const sourceSteps = (rawSteps && rawSteps.length === 5) ? rawSteps : (cfg.steps && cfg.steps.length === 5 ? cfg.steps : defaultSteps)

  const timelineSteps: TimelineStep[] = sourceSteps.map(([title, desc, status, time], idx) => ({
    stepNumber: idx + 1,
    title,
    description: desc,
    status,
    ...(time ? { timestamp: time } : {}),
  }))

  const assignedCA = cfg.assignedCA || 'CA not assigned yet'
  const expectedCompletion = cfg.expectedCompletion || '15 Oct 2026'
  const paymentStatus = cfg.rawApplication?.paymentStatus || cfg.paymentStatus || 'Paid'

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
      transactionId: cfg.transactionId || cfg.rawApplication?.transactionId || `TXN-${appId.replace(/\D/g, '').slice(-6) || '91842'}`,
      paymentMethod: (cfg.rawApplication as any)?.paymentMethod || 'UPI',
      paymentDate: cfg.paymentDate || cfg.rawApplication?.paidAt || date,
      paymentStatus,
    },
  }
}

export function getApplicationTrackerData(id?: string): ApplicationTrackerData | null {
  const userApps = userStorage.getUserApplications()
  const cleanId = (id || '').trim().toLowerCase()

  // Match application by exact id or code first, then digits, or draft
  const matchedAppFromStorage =
    userApps.find((a) => (a.id || '').toLowerCase() === cleanId || (a.code || '').toLowerCase() === cleanId) ||
    userApps.find((a) => {
      const aCode = (a.code || '').toLowerCase()
      const aDigits = aCode.replace(/\D/g, '')
      const cleanDigits = cleanId.replace(/\D/g, '')
      return Boolean(cleanDigits && cleanDigits.length >= 4 && aDigits === cleanDigits)
    })

  const currentUser = authStorage.getUser()
  const defaultAppId = cleanId ? cleanId.toUpperCase() : 'APP-PENDING'
  const defaultEntity = currentUser?.fullName || 'Applicant'
  const defaultDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())

  let matchedApp: RecentApplication | null = matchedAppFromStorage || null

  const isDraftId = cleanId.startsWith('draft-') || cleanId.startsWith('draft') || cleanId.includes('draft')

  // Draft applications must NEVER display tracking details or fake timelines
  if (isDraftId) {
    return null
  }

  if (!matchedApp) {
    matchedApp = cleanId ? null : (userApps[0] || null)
  }

  if (!matchedApp) {
    matchedApp = {
      id: defaultAppId,
      code: defaultAppId,
      title: cleanId.startsWith('gst-fil') || cleanId.includes('filing')
        ? 'GST Filing'
        : cleanId.startsWith('gst-reg') || cleanId.includes('registration')
        ? 'GST Registration'
        : cleanId.startsWith('gst-amd') || cleanId.includes('amendment')
        ? 'GST Amendment'
        : cleanId.includes('compliance')
        ? 'GST Compliance'
        : cleanId.includes('certificate') || cleanId.includes('cert') || cleanId.startsWith('gst-crt')
        ? 'GST Certificate (REG-06)'
        : cleanId.includes('cancellation')
        ? 'GST Cancellation (REG-16)'
        : cleanId.includes('tds') || cleanId.includes('refund')
        ? 'TDS Refund'
        : cleanId.includes('loan')
        ? (cleanId.includes('home') ? 'Home Loan Application' : cleanId.includes('business') ? 'Business Loan Application' : 'Personal Loan Application')
        : cleanId.includes('incorporation') || cleanId.includes('company')
        ? 'Company Incorporation'
        : cleanId.includes('gst')
        ? 'GST Filing'
        : 'ITR Filing - ITR-1 (Sahaj) - Salary & Other Income',
      meta: `${defaultEntity} · Current Period`,
      statusLabel: isDraftId ? 'Draft' : 'Submitted',
      statusTone: 'info',
      progress: 25,
      icon: '📄',
      to: '',
      paymentStatus: isDraftId ? ('Awaiting Verification' as any) : ('Paid' as any),
    }
  }

  const metaParts = (matchedApp.meta || '').split('·').map((s) => s.trim())
  const entity = currentUser?.fullName || metaParts[0] || 'Applicant'
  const appId = matchedApp.code || matchedApp.id
  const rawDate = (matchedApp as { date?: string; savedAt?: string }).date || (matchedApp as any)?.createdAt
  const date = rawDate
    ? (rawDate.includes('am') || rawDate.includes('pm') ? rawDate : `${rawDate}, ${(matchedApp as any)?.savedAt || '11:36 am'}`)
    : `${defaultDate}, ${(matchedApp as any)?.savedAt || '11:36 am'}`
  const key = (matchedApp.title || appId).toLowerCase()
  const pan = currentUser?.pan ? currentUser.pan.toUpperCase() : 'Submitted in Application'

  // 1. GST Amendment
  if (key.includes('amendment')) {
    const isAwaiting = isDraftId || (matchedApp as any)?.paymentStatus === 'Awaiting Verification'
    return buildTracker(appId, entity, date, {
      title: 'GST Amendment',
      category: 'GST',
      stageTitle: matchedApp.statusLabel || 'Verification & Processing in Progress',
      filingHeader: 'GST Amendment Request Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Business Entity', value: entity },
        { label: 'Target GSTIN', value: (currentUser as { gstin?: string })?.gstin || '27AAAAA0000A1Z5', isHighlight: true },
        { label: 'Application ARN', value: appId, isHighlight: true },
        { label: 'Amended Section', value: metaParts[0] || 'Core Field' },
        { label: 'Jurisdiction', value: currentUser?.state || 'India' },
        { label: 'Status', value: matchedApp.statusLabel || 'Submitted', isHighlight: true },
      ],
      steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
      docs: [
        ['d1', 'Supporting Proof Document', 'uploaded'],
        ['d2', 'Identity & Authorization Proof', 'uploaded'],
      ],
      payment: isAwaiting ? ['Not Assigned', '₹0', '₹0', 'Not Assigned'] : ['Service Fee', '₹0', 'Included', 'Paid'],
      paymentStatus: isAwaiting ? 'Awaiting Verification' : 'Paid',
    })
  }

  // 2. GST Return Filing (including GST-FIL)
  if (
    ((key.includes('gst') || (matchedApp as { category?: string }).category === 'GST') && (key.includes('filing') || key.includes('return'))) ||
    appId.toLowerCase().startsWith('gst-fil')
  ) {
    const filDraft = userStorage.getDraft('gst-filing') || readServiceDraft<any>('gst-filing', 'gst')
    const filFormData = (matchedApp as any)?.formData || filDraft?.formData
    const fData = filFormData?.filingData || {}

    const bName = fData.businessName || entity
    const targetGstin = fData.gstin || (currentUser as any)?.gstin || '27AAAAA0000A1Z5'
    const returnType = fData.returnType || 'GSTR-3B'
    const filingPeriod = fData.selectedMonth || metaParts[1] || 'September 2026'
    const frequency = fData.filingFrequency || 'Monthly'
    const grossTurnover = fData.turnover ? `₹${Number(fData.turnover).toLocaleString('en-IN')}` : '₹12,45,000'
    const taxPayable = fData.taxAmount ? `₹${Number(fData.taxAmount).toLocaleString('en-IN')}` : '₹1,12,050'

    const dynamicFilingDocs: Array<[string, string, 'uploaded' | 'pending', string?]> = [
      ['sales-invoices', 'Sales Invoices / Register', 'uploaded'],
      ['credit-notes', 'Credit Notes', 'uploaded'],
      ['debit-notes', 'Debit Notes', 'uploaded'],
      ['irn-data', 'E-Invoice Data (IRN)', 'uploaded'],
      ['eway-data', 'E-Way Bill Data', 'uploaded'],
      ['purchase-invoices', 'Purchase Invoices / Register', 'uploaded'],
      ['gstr2b-statement', 'GSTR-2B ITC Statement', 'uploaded'],
      ['expense-invoices', 'Expense Invoices & Vouchers', 'uploaded'],
      ['bank-statements', 'Bank Statement / Passbook', 'uploaded'],
      ['prev-gst-returns', 'Previous GST Returns', 'uploaded'],
      ['prev-filing-ack', 'Previous Filing Acknowledgement', 'uploaded'],
      ['other-supporting-docs', 'Other Supporting Documents', 'uploaded'],
    ]

    const isAwaiting = isDraftId || (matchedApp as any)?.paymentStatus === 'Awaiting Verification'

    return buildTracker(appId, entity, date, {
      title: matchedApp.title || 'GST Return Filing',
      category: 'GST',
      stageTitle: matchedApp.statusLabel || 'Document Collection in Progress',
      filingHeader: 'GST Return Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Business Entity', value: bName },
        { label: 'Target GSTIN', value: targetGstin, isHighlight: true },
        { label: 'Return Type', value: returnType },
        { label: 'Filing Period', value: filingPeriod },
        { label: 'Filing Frequency', value: frequency },
        { label: 'Gross Turnover', value: grossTurnover },
        { label: 'Tax Payable', value: taxPayable },
        { label: 'Application Ref', value: appId, isHighlight: true },
        { label: 'Filing Status', value: matchedApp.statusLabel || 'Submitted', isHighlight: true },
      ],
      steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
      docs: dynamicFilingDocs,
      payment: isAwaiting
        ? ['Not Assigned', '₹0', '₹0', 'Not Assigned']
        : ['₹847', '₹0 (Included)', '₹152', '₹999'],
      paymentStatus: isAwaiting ? 'Awaiting Verification' : ((matchedApp as any)?.paymentStatus || 'Paid'),
    })
  }

  // 3. GST Registration
  if (key.includes('registration')) {
    const regDraft = userStorage.getDraft('gst-registration') || readServiceDraft<any>('gst-registration', 'gst')
    const regFormData = (matchedApp as any)?.formData || regDraft?.formData
    const bData = regFormData?.businessData || {}

    const legalName = bData.legalName || entity
    const tradeName = bData.tradeName || legalName
    const constitution = bData.constitution || 'Private Limited Company'
    const bPan = bData.businessPan || pan
    const nature = bData.natureOfBusiness || 'Trading / Retail / Services'
    const address = bData.principalAddress || bData.businessAddress || '101, Commercial Hub, Mumbai'
    const jurisdiction = bData.state || currentUser?.state || metaParts[1] || 'Maharashtra'
    const commencement = bData.commencementDate || '01 Apr 2026'

    const dynamicRegistrationDocs: Array<[string, string, 'uploaded' | 'pending', string?]> = [
      ['pan', 'PAN Card', 'uploaded'],
      ['aadhaar', 'Aadhaar Card', 'uploaded'],
      ['business_reg', 'Business Registration Proof', 'uploaded'],
      ['address_proof', 'Principal Place Address Proof', 'uploaded'],
      ['bank_proof', 'Bank Passbook / Cancelled Cheque', 'uploaded'],
      ['photo', 'Passport Size Photograph', 'uploaded'],
    ]

    const isAwaiting = isDraftId || (matchedApp as any)?.paymentStatus === 'Awaiting Verification'

    return buildTracker(appId, entity, date, {
      title: matchedApp.title || 'GST Registration',
      category: 'GST',
      stageTitle: matchedApp.statusLabel || 'Document Verification in Progress',
      filingHeader: 'Registration Filing Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Legal Name', value: legalName },
        { label: 'Trade Name', value: tradeName },
        { label: 'Constitution of Business', value: constitution },
        { label: 'Business PAN', value: bPan, isHighlight: true },
        { label: 'Nature of Business', value: nature },
        { label: 'Principal Place of Business', value: address },
        { label: 'State / Jurisdiction', value: jurisdiction },
        { label: 'Date of Commencement', value: commencement },
        { label: 'Application Ref', value: appId },
        { label: 'Filing Status', value: matchedApp.statusLabel || 'Submitted', isHighlight: true },
      ],
      steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
      docs: dynamicRegistrationDocs,
      payment: isAwaiting
        ? ['Not Assigned', '₹0', '₹0', 'Not Assigned']
        : ['Paid with Filing', '₹0', 'Included', 'Paid'],
      paymentStatus: isAwaiting ? 'Awaiting Verification' : ((matchedApp as any)?.paymentStatus || 'Paid'),
    })
  }

  // 4. GST Compliance / Notice Response
  if (key.includes('compliance') || key.includes('notice response')) {
    return buildTracker(appId, entity, date, {
      title: matchedApp.title || 'GST Compliance',
      category: 'GST',
      stageTitle: matchedApp.statusLabel || 'Under CA Review',
      filingHeader: 'GST Notice Response Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Business Entity', value: entity },
        { label: 'Target GSTIN', value: (currentUser as { gstin?: string })?.gstin || '29AAAAA0000A1Z5', isHighlight: true },
        { label: 'Application Ref', value: appId },
        { label: 'Request Type', value: metaParts[0] || 'Notice Response' },
        { label: 'Filing Status', value: matchedApp.statusLabel || 'Submitted', isHighlight: true },
      ],
      steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
      docs: [
        ['d1', 'Official GST Notice Copy', 'uploaded'],
        ['d2', 'Supporting Clarification Documents', 'uploaded'],
      ],
      payment: ['Service Fee', '₹0', 'Included', 'Paid'],
    })
  }

  // 5. GST Certificate Request
  if (key.includes('certificate') || key.includes('cert') || key.includes('gst-crt')) {
    const isApproved =
      matchedApp.statusLabel === 'Approved' ||
      matchedApp.statusLabel === 'Completed' ||
      (matchedApp as any)?.managerApproved === true

    const certGstin =
      (currentUser as { gstin?: string })?.gstin ||
      (matchedApp as any)?.gstin ||
      (matchedApp.meta?.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/)?.[0]) ||
      '29AAAAA0000A1Z5'

    return buildTracker(appId, entity, date, {
      title: 'GST Certificate (REG-06)',
      category: 'GST',
      stageTitle: isApproved ? 'Certificate Approved & Ready' : (matchedApp.statusLabel || 'Under Verification'),
      filingHeader: 'GST Certificate Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Business Entity', value: entity },
        { label: 'GSTIN', value: certGstin, isHighlight: true },
        { label: 'Form Number', value: 'Form GST REG-06' },
        { label: 'Status', value: isApproved ? 'Approved & Ready' : 'Under Verification', isHighlight: true },
      ],
      steps: [
        [
          'Application Submitted',
          `Application successfully submitted on ${date}.`,
          'completed',
          date,
        ],
        [
          'Document Verification',
          'Review of identity, premises and taxpayer record.',
          isApproved ? 'completed' : 'current',
        ],
        [
          'Manager Review & Approval',
          'Tax officer / CA Manager scrutiny and document generation.',
          isApproved ? 'completed' : 'pending',
        ],
        [
          'Certificate Ready for Download',
          'Form GST REG-06 registration certificate released for download.',
          isApproved ? 'completed' : 'pending',
        ],
      ],
      docs: [
        ['REG-06', 'Registration Certificate (REG-06)', isApproved ? 'uploaded' : 'pending'],
        ['d2', 'Taxpayer Verification Record', 'uploaded'],
      ],
      payment: ['Service Fee', '₹0', 'Included', 'Paid'],
      paymentStatus: 'Paid',
    })
  }

  // 6. GST Cancellation
  if (key.includes('cancellation')) {
    return buildTracker(appId, entity, date, {
      title: 'GST Cancellation (REG-16)',
      category: 'GST',
      stageTitle: matchedApp.statusLabel || 'Under Officer Review',
      filingHeader: 'GST Cancellation Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Business Entity', value: entity },
        { label: 'GSTIN', value: (currentUser as { gstin?: string })?.gstin || '29AAAAA0000A1Z5', isHighlight: true },
        { label: 'Application ARN', value: appId },
        { label: 'Cancellation Reason', value: metaParts[1] || 'Closure of Business' },
        { label: 'Status', value: matchedApp.statusLabel || 'Submitted', isHighlight: true },
      ],
      steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
      docs: [
        ['d1', 'Cancellation Application (REG-16)', 'uploaded'],
        ['d2', 'Closing Stock & Liability Declaration', 'uploaded'],
      ],
      payment: ['Service Fee', '₹0', 'Included', 'Paid'],
    })
  }

  // 7. TDS Refund
  if (key.includes('tds') || key.includes('refund')) {
    const refundClaim = metaParts.find((p) => p.includes('₹')) || 'As Declared'
    const isChargesFinalized = Boolean(matchedApp.chargesFinalized && matchedApp.finalizedCharges)
    const ch = matchedApp.finalizedCharges
    const currentPaymentStatus = matchedApp.paymentStatus || (isChargesFinalized ? 'Pending' : 'Charges Pending')

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

    const steps = getDefaultApplicationSteps(date, currentPaymentStatus === 'Paid' ? 'Paid' : isChargesFinalized ? 'Payment Due' : matchedApp.statusLabel)

    const stageTitle = isChargesFinalized
      ? (currentPaymentStatus === 'Paid' ? 'Processing with Income Tax Dept' : 'Charges Finalized — Payment Due')
      : (matchedApp.statusLabel || 'Under CA Review & Assessment')

    return buildTracker(appId, entity, date, {
      title: matchedApp.title,
      category: 'ITR',
      stageTitle,
      filingHeader: 'TDS Refund Details',
      assignedCA,
      expectedCompletion,
      paymentStatus,
      paymentDate,
      transactionId: matchedApp.transactionId,
      chargesFinalized: isChargesFinalized,
      finalizedCharges: ch,
      rawApplication: matchedApp,
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

  // 8. ITR Filing
  if (key.includes('itr') || key.includes('income tax')) {
    const title = matchedApp.title.includes('ITR-1') || matchedApp.title.includes('Sahaj')
      ? matchedApp.title
      : 'ITR Filing - ITR-1 (Sahaj) - Salary & Other Income'

    return buildTracker(appId, entity, date, {
      title,
      category: 'ITR',
      stageTitle: 'Document Verification',
      assignedCA: 'CA not assigned yet',
      expectedCompletion: '15 Oct 2026',
      paymentStatus: 'Pending',
      filingHeader: 'Income Tax Return Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Customer / Entity', value: entity },
        { label: 'Service', value: title },
        { label: 'Application ID', value: appId, isHighlight: true },
        { label: 'Applied Date', value: date },
        { label: 'Assigned CA', value: 'CA not assigned yet' },
        { label: 'Expected Completion', value: '15 Oct 2026' },
      ],
      steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
      docs: [
        ['d1', 'Form 16 / Salary Certificate', 'uploaded'],
        ['d2', 'Bank Statement / Interest Certificate', 'uploaded'],
        ['d3', 'Tax Deduction & Investment Proofs (80C, 80D)', 'uploaded'],
      ],
      payment: ['₹847', '₹0 (Included)', '₹152', '₹999'],
    })
  }

  // 9. Company Incorporation
  if (key.includes('incorporation') || key.includes('company') || key.includes('pvt ltd') || key.includes('llp')) {
    return buildTracker(appId, entity, date, {
      title: matchedApp.title || 'Company Incorporation',
      category: 'Business',
      stageTitle: matchedApp.statusLabel || 'Name Reservation in Progress',
      filingHeader: 'Company Incorporation Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Proposed Company Name', value: entity },
        { label: 'PAN', value: pan, isHighlight: true },
        { label: 'Application Ref', value: appId },
        { label: 'Service Type', value: matchedApp.title },
        { label: 'Jurisdiction', value: currentUser?.state || 'India' },
        { label: 'Status', value: matchedApp.statusLabel || 'Submitted', isHighlight: true },
      ],
      steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
      docs: [
        ['d1', 'Directors Identity Proof (PAN, Passport / Voter ID)', 'uploaded'],
        ['d2', 'Directors Residential Address Proof', 'uploaded'],
        ['d3', 'Registered Office Proof (Electricity Bill & NOC)', 'uploaded'],
      ],
      payment: ['₹2,499', '₹1,000 (MCA / Stamp Duty)', '₹450', '₹3,949'],
    })
  }

  // 10. Loans
  if (key.includes('loan')) {
    const isHome = key.includes('home')
    const isPersonal = key.includes('personal')
    const isVehicle = key.includes('vehicle')
    const isProperty = key.includes('property')

    const loanDocs: Array<[string, string, 'uploaded' | 'pending', string?]> = isPersonal
      ? [
          ['d1', 'PAN & Aadhaar KYC Proof', 'uploaded'],
          ['d2', 'Current Residence Address Proof', 'uploaded'],
          ['d3', 'Salary Slips (Last 3 Months)', 'uploaded'],
          ['d4', 'Bank Statement (Last 6 Months)', 'uploaded'],
        ]
      : isHome
      ? [
          ['d1', 'Applicant KYC Documents', 'uploaded'],
          ['d2', 'Income Proof (Salary Slips / Form 16 / ITR)', 'uploaded'],
          ['d3', 'Bank Statement (Last 6 Months)', 'uploaded'],
          ['d4', 'Property Documents & Sale Agreement', 'uploaded'],
        ]
      : isVehicle
      ? [
          ['d1', 'Identity & Address Proof', 'uploaded'],
          ['d2', 'Income Proof & Bank Statements', 'uploaded'],
          ['d3', 'Vehicle Quotation / Proforma Invoice', 'uploaded'],
        ]
      : isProperty
      ? [
          ['d1', 'Identity & Address Proof', 'uploaded'],
          ['d2', 'Title Deed / Property Documents', 'uploaded'],
          ['d3', 'Income Proof & Bank Statement', 'uploaded'],
        ]
      : [
          ['d1', 'Business Registration & GST Certificate', 'uploaded'],
          ['d2', 'Financial Statements & ITR (Last 2 Years)', 'uploaded'],
          ['d3', 'Bank Statement (Last 12 Months)', 'uploaded'],
        ]

    return buildTracker(appId, entity, date, {
      title: matchedApp.title,
      category: 'Loans',
      stageTitle: matchedApp.statusLabel || 'Documents Received & Underwriting',
      filingHeader: 'Loan Application Details',
      rawApplication: matchedApp,
      filingFields: [
        { label: 'Applicant Name', value: entity },
        { label: 'PAN', value: pan, isHighlight: true },
        { label: 'Application Ref', value: appId },
        { label: 'Loan Type', value: matchedApp.title },
        { label: 'Status', value: matchedApp.statusLabel || 'Documents Received', isHighlight: true },
      ],
      steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
      docs: loanDocs,
      payment: ['Processing Fee', '₹0', 'Included in Sanction', 'Paid'],
    })
  }

  // 11. Generic / Fallback Service
  return buildTracker(appId, entity, date, {
    title: matchedApp.title,
    category: (matchedApp.title.toLowerCase().includes('insurance') ? 'Insurance' : 'Business') as ApplicationTrackerData['category'],
    stageTitle: matchedApp.statusLabel || 'Application Processing',
    filingHeader: 'Application Details',
    rawApplication: matchedApp,
    filingFields: [
      { label: 'Applicant / Entity', value: entity },
      { label: 'PAN', value: pan, isHighlight: true },
      { label: 'Application Ref', value: appId },
      { label: 'Service Description', value: matchedApp.title },
      { label: 'Status', value: matchedApp.statusLabel || 'Submitted', isHighlight: true },
    ],
    steps: getDefaultApplicationSteps(date, matchedApp.statusLabel),
    docs: [
      ['d1', 'Applicant KYC & Identification', 'uploaded'],
      ['d2', 'Financial Statements / Supporting Proofs', 'uploaded'],
    ],
    payment: ['Paid with Application', '₹0', 'Included', 'Paid'],
  })
}
