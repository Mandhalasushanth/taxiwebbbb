import { UPLOAD_HINT } from '@shared/upload'

export interface UploadDocItem {
  id: string
  title: string
  category: 'Applicant' | 'Project' | 'Financial'
  subtitle: string
  required: boolean
  iconType: 'user' | 'building' | 'file' | 'chart' | 'money' | 'attachment'
}

export const PROJECT_FINANCE_DOC_LIST: UploadDocItem[] = [
  {
    id: 'identityProof',
    title: 'Identity Proof (Aadhaar / PAN)',
    category: 'Applicant',
    subtitle: UPLOAD_HINT,
    required: true,
    iconType: 'user',
  },
  {
    id: 'businessRegistrationCertificate',
    title: 'Business Registration Certificate',
    category: 'Applicant',
    subtitle: UPLOAD_HINT,
    required: true,
    iconType: 'building',
  },
  {
    id: 'projectDetailedReport',
    title: 'Project Detailed Report (DPR)',
    category: 'Project',
    subtitle: UPLOAD_HINT,
    required: true,
    iconType: 'file',
  },
  {
    id: 'projectCostEstimate',
    title: 'Project Cost Estimate / Quotation',
    category: 'Project',
    subtitle: UPLOAD_HINT,
    required: true,
    iconType: 'chart',
  },
  {
    id: 'financialStatements',
    title: 'Financial Statements (Last 3 Years)',
    category: 'Financial',
    subtitle: UPLOAD_HINT,
    required: true,
    iconType: 'money',
  },
  {
    id: 'landPropertyDocuments',
    title: 'Land / Property Documents (if applicable)',
    category: 'Project',
    subtitle: UPLOAD_HINT,
    required: false,
    iconType: 'file',
  },
  {
    id: 'otherSupportingDocuments',
    title: 'Other Supporting Documents',
    category: 'Project',
    subtitle: UPLOAD_HINT,
    required: false,
    iconType: 'attachment',
  },
]
