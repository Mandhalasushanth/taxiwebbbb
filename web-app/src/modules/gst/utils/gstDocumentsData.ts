export type DocumentBadgeType = 'Required' | 'If applicable' | 'Recommended' | 'Optional'

export type DocumentIconType =
  | 'invoice'
  | 'credit-note'
  | 'debit-note'
  | 'irn'
  | 'eway'
  | 'purchase'
  | 'gstr2b'
  | 'expense'
  | 'bank'
  | 'prev-returns'
  | 'arn'
  | 'other'

export interface DocumentItemDef {
  id: string
  categoryId: string
  title: string
  subtitle: string
  badge: DocumentBadgeType
  isRequired?: boolean
  iconType: DocumentIconType
}

export interface DocumentCategoryDef {
  id: string
  title: string
}

export interface UploadedFileInfo {
  name: string
  sizeText: string
  uploadTime: string
  fileUrl?: string
  status?: 'verified' | 'pending' | 'rejected'
}


export const DOCUMENT_CATEGORIES: DocumentCategoryDef[] = [
  { id: 'sales', title: 'SALES & OUTWARD SUPPLIES' },
  { id: 'purchases', title: 'PURCHASES & INPUT TAX' },
  { id: 'banking', title: 'BANKING & RECONCILIATION' },
  { id: 'statutory', title: 'STATUTORY & COMPLIANCE' },
]

export const DEFAULT_DOCUMENT_ITEMS: DocumentItemDef[] = [
  // 1. Sales & Outward Supplies
  {
    id: 'sales-invoices',
    categoryId: 'sales',
    title: 'Sales Invoices / Register',
    subtitle: 'Outward supply bill book / tax invoices',
    badge: 'Required',
    isRequired: true,
    iconType: 'invoice',
  },
  {
    id: 'credit-notes',
    categoryId: 'sales',
    title: 'Credit Notes',
    subtitle: 'Issued during the period for sales returns',
    badge: 'If applicable',
    isRequired: false,
    iconType: 'credit-note',
  },
  {
    id: 'debit-notes',
    categoryId: 'sales',
    title: 'Debit Notes',
    subtitle: 'Issued for rate differences or adjustments',
    badge: 'If applicable',
    isRequired: false,
    iconType: 'debit-note',
  },
  {
    id: 'irn-data',
    categoryId: 'sales',
    title: 'E-Invoice Data (IRN)',
    subtitle: 'JSON / PDF files where applicable',
    badge: 'If applicable',
    isRequired: false,
    iconType: 'irn',
  },
  {
    id: 'eway-data',
    categoryId: 'sales',
    title: 'E-Way Bill Data',
    subtitle: 'Consolidated transit bills for goods movement',
    badge: 'If applicable',
    isRequired: false,
    iconType: 'eway',
  },

  // 2. Purchases & Input Tax
  {
    id: 'purchase-invoices',
    categoryId: 'purchases',
    title: 'Purchase Invoices / Register',
    subtitle: 'Inward supply tax invoices with GST details',
    badge: 'Required',
    isRequired: true,
    iconType: 'purchase',
  },
  {
    id: 'gstr2b-statement',
    categoryId: 'purchases',
    title: 'GSTR-2B ITC Statement',
    subtitle: 'Auto-drafted ITC statement from GST portal',
    badge: 'Required',
    isRequired: true,
    iconType: 'gstr2b',
  },
  {
    id: 'expense-invoices',
    categoryId: 'purchases',
    title: 'Expense Invoices & Vouchers',
    subtitle: 'Electricity, telephone, logistics, rent etc.',
    badge: 'Recommended',
    isRequired: false,
    iconType: 'expense',
  },

  // 3. Banking & Reconciliation
  {
    id: 'bank-statements',
    categoryId: 'banking',
    title: 'Bank Statements',
    subtitle: 'Bank statements for all active business accounts',
    badge: 'Recommended',
    isRequired: false,
    iconType: 'bank',
  },
  {
    id: 'prev-gst-returns',
    categoryId: 'banking',
    title: 'Previous GST Returns',
    subtitle: 'Copies of previous GSTR-1 & GSTR-3B',
    badge: 'Recommended',
    isRequired: false,
    iconType: 'prev-returns',
  },
  {
    id: 'prev-filing-ack',
    categoryId: 'banking',
    title: 'Previous Filing Acknowledgement',
    subtitle: 'ARN receipt copy for ITC balance and reconciliation',
    badge: 'Recommended',
    isRequired: false,
    iconType: 'arn',
  },

  // 4. Statutory & Compliance
  {
    id: 'other-supporting-docs',
    categoryId: 'statutory',
    title: 'Other Supporting Documents',
    subtitle: 'Challans, ledgers, or CA reconciliation files',
    badge: 'Optional',
    isRequired: false,
    iconType: 'other',
  },
]


export {
  calculateDocumentSummary,
  type DocumentSummaryType,
  type DocumentSummaryStatus,
  type CalculatedDocumentSummaryItem,
  type DocumentSummaryResult,
} from './gstDocumentsSummary'


