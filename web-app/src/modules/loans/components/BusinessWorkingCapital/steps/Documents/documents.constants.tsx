import {
  CreditCard,
  Building2,
  Receipt,
  FileText,
  ShieldCheck,
  BarChart3,
} from 'lucide-react'
import type { FinancingFacility } from '@modules/loans/types/businessWorkingCapital.types'
import type { LoanDocumentDefinition } from '@modules/loans/documents/loanDocument.types'

export interface BwcDocDefinition extends LoanDocumentDefinition {
  isGstDependent?: boolean
}

/** 4 documents for Business Loan matching the reference specification */
export const BWC_BUSINESS_LOAN_DOCS: BwcDocDefinition[] = [
  {
    id: 'panCard',
    title: 'Business / Promoter PAN Card',
    subtitle: 'Entity or proprietor PAN for verification & KYC appraisal',
    isRequired: true,
    category: 'identity',
    icon: <CreditCard size={20} aria-hidden="true" />,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'businessRegistrationProof',
    title: 'Business Registration Proof',
    subtitle: 'Udyam Registration, Certificate of Incorporation, or Trade License',
    isRequired: true,
    category: 'business',
    icon: <Building2 size={20} aria-hidden="true" />,
    iconBg: '#EFF6FF',
    iconColor: '#0284C7',
  },
  {
    id: 'bankStatements',
    title: 'Business Bank Statement (Last 6 Months)',
    subtitle: 'Primary current account statements for operational validation',
    isRequired: false,
    category: 'financials',
    icon: <Receipt size={20} aria-hidden="true" />,
    iconBg: '#EFF6FF',
    iconColor: '#1D4ED8',
  },
  {
    id: 'equipmentQuotation',
    title: 'Equipment Quotation / Project Estimate',
    subtitle: 'Vendor invoice or quotation if available',
    isRequired: false,
    category: 'financials',
    icon: <FileText size={20} aria-hidden="true" />,
    iconBg: '#EFF6FF',
    iconColor: '#0369A1',
  },
]

/** 4 documents for Working Capital facility matching the reference specification */
export const BWC_WORKING_CAPITAL_DOCS: BwcDocDefinition[] = [
  {
    id: 'panCard',
    title: 'Business / Promoter PAN Card',
    subtitle: 'Entity or proprietor PAN for verification & KYC appraisal',
    isRequired: true,
    category: 'identity',
    icon: <CreditCard size={20} aria-hidden="true" />,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'bankStatements',
    title: 'Business Bank Statement (Last 12 Months)',
    subtitle: 'Primary operating bank statement required for CC/OD limit appraisal',
    isRequired: true,
    category: 'financials',
    icon: <Receipt size={20} aria-hidden="true" />,
    iconBg: '#EFF6FF',
    iconColor: '#1D4ED8',
  },
  {
    id: 'businessLicenseProof',
    title: 'Business License / Trade Proof',
    subtitle: 'Local authority trade license or shop establishment certificate',
    isRequired: true,
    category: 'business',
    icon: <ShieldCheck size={20} aria-hidden="true" />,
    iconBg: '#EFF6FF',
    iconColor: '#0284C7',
  },
  {
    id: 'auditedFinancials',
    title: 'Audited Financials / P&L (Last 2 Years)',
    subtitle: 'Audited balance sheet & ITR filings for credit underwriting',
    isRequired: false,
    category: 'financials',
    icon: <BarChart3 size={20} aria-hidden="true" />,
    iconBg: '#EFF6FF',
    iconColor: '#0284C7',
  },
]

export const getBwcDocumentList = (
  facilityOrGst: FinancingFacility | boolean = 'business-loan',
  _isGst = false,
): BwcDocDefinition[] => {
  const facility: FinancingFacility = typeof facilityOrGst === 'string' ? facilityOrGst : 'business-loan'

  if (facility === 'working-capital') {
    return BWC_WORKING_CAPITAL_DOCS
  }

  return BWC_BUSINESS_LOAN_DOCS
}

