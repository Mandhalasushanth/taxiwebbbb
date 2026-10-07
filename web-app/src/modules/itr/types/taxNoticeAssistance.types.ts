export interface NoticeFormData {
  pan: string
  assessmentYear: string
  noticeType: string
  noticeDate: string
  noticeReference: string
  responseDueDate: string
  explanation: string
  documentFile: File | null
  documentFileName: string
  documentFileSize: string
  supportingDocuments?: Record<string, { fileName: string; fileSize: string; fileUrl?: string; file?: File }>
  remarks?: string
  responseConfirmed?: boolean
  applicationCode?: string
  acknowledgementNo?: string
  assignedExecutive?: string
  submittedAt?: string
}

export const ASSESSMENT_YEAR_OPTIONS = [
  'AY 2027-28',
  'AY 2026-27',
  'AY 2025-26',
  'AY 2024-25',
  'AY 2023-24',
  'AY 2022-23',
]

export interface NoticeTypeOption {
  title: string
  description: string
}

export const NOTICE_TYPE_DETAILS: NoticeTypeOption[] = [
  {
    title: 'Section 143(1)(a) - Proposed Adjustment',
    description: 'Discrepancy between reported income/deductions and AIS/26AS',
  },
  {
    title: 'Section 139(9) - Defective Return',
    description: 'Incomplete return, missing schedules, or audit discrepancies',
  },
  {
    title: 'Section 142(1) - Inquiry / Production of Accounts',
    description: 'Notice calling for specific documents or accounts before assessment',
  },
  {
    title: 'Section 148 / 148A - Income Escaping Assessment',
    description: 'Re-assessment notice for undisclosed or unassessed income',
  },
  {
    title: 'Section 156 - Notice of Demand',
    description: 'Demand notice for outstanding tax, interest, or penalty payable',
  },
  {
    title: 'Section 245 - Refund Adjustment Intimation',
    description: 'Intimation proposing to adjust pending refund against past demand',
  },
  {
    title: 'Other Notice / Communication',
    description: 'Any other official notice or query from the Income Tax Department',
  },
]

export const NOTICE_TYPE_OPTIONS = NOTICE_TYPE_DETAILS.map((opt) => opt.title)

export interface SupportingDocumentItem {
  id: string
  title: string
  subtitle: string
  required: boolean
}

export const SUPPORTING_DOCUMENT_LIST: SupportingDocumentItem[] = [
  {
    id: 'tax-notice',
    title: 'Tax Notice',
    subtitle: 'Uploaded tax notice copy from IT department',
    required: true,
  },
  {
    id: 'previous-itr',
    title: 'Previous ITR',
    subtitle: 'Filed return form for the relevant or preceding year',
    required: true,
  },
  {
    id: 'itr-ack',
    title: 'ITR Acknowledgement',
    subtitle: 'ITR-V acknowledgement receipt of return',
    required: true,
  },
  {
    id: 'form-16',
    title: 'Form 16 / 16A',
    subtitle: 'TDS certificates issued by employer or deductors',
    required: true,
  },
  {
    id: 'ais',
    title: 'AIS (AY 2025–26)',
    subtitle: 'Comprehensive statement from the Income Tax portal',
    required: true,
  },
  {
    id: 'tis',
    title: 'TIS (Taxpayer Information Summary) (Optional)',
    subtitle: 'Summary statement of taxable financial transactions',
    required: false,
  },
  {
    id: 'bank-statements',
    title: 'Bank Statements',
    subtitle: 'Full financial year statement of all bank accounts',
    required: true,
  },
  {
    id: 'supporting-income',
    title: 'Supporting Income Documents (Optional)',
    subtitle: 'Interest certificates, dividend statements, capital gains',
    required: false,
  },
  {
    id: 'supporting-expense',
    title: 'Supporting Expense Documents (Optional)',
    subtitle: '80C/80D proofs, medical bills, donation receipts',
    required: false,
  },
  {
    id: 'previous-responses',
    title: 'Previous Tax Responses (Optional)',
    subtitle: 'Any past submissions, letters, or rectification requests',
    required: false,
  },
  {
    id: 'other-documents',
    title: 'Other Notice-Specific Documents (Optional)',
    subtitle: 'Property registry deeds, gift deeds, agreements',
    required: false,
  },
]
