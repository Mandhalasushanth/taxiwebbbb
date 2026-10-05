import type { LucideIcon } from 'lucide-react'
import { CreditCard, Fingerprint, Home, Camera, FileText } from 'lucide-react'

export interface DocDef {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  category: 'IDENTITY & ADDRESS' | 'INCOME & BANKING'
}

export const PERSONAL_DOCS_LIST: DocDef[] = [
  {
    id: 'pan_card',
    title: 'PAN Card',
    subtitle: 'Clear photo or PDF copy of applicant PAN',
    icon: CreditCard,
    iconColor: '#0284c7',
    iconBg: '#e0f2fe',
    category: 'IDENTITY & ADDRESS',
  },
  {
    id: 'aadhaar_card',
    title: 'Aadhaar Card',
    subtitle: 'Front & back copy with readable QR code',
    icon: Fingerprint,
    iconColor: '#9333ea',
    iconBg: '#f3e8ff',
    category: 'IDENTITY & ADDRESS',
  },
  {
    id: 'address_proof',
    title: 'Address Proof',
    subtitle: 'Utility bill / Rent Agreement / Voter ID',
    icon: Home,
    iconColor: '#2563eb',
    iconBg: '#e0f2fe',
    category: 'IDENTITY & ADDRESS',
  },
  {
    id: 'passport_photo',
    title: 'Passport Size Photograph',
    subtitle: 'Recent colour photo of the applicant',
    icon: Camera,
    iconColor: '#db2777',
    iconBg: '#fae8ff',
    category: 'IDENTITY & ADDRESS',
  },
  {
    id: 'bank_statements',
    title: 'Bank Statements',
    subtitle: 'Last 6 to 12 months salary/savings statement in PDF',
    icon: FileText,
    iconColor: '#d97706',
    iconBg: '#fef3c7',
    category: 'INCOME & BANKING',
  },
  {
    id: 'salary_slips',
    title: 'Salary Slips',
    subtitle: 'Last 3 to 6 months payslips with company seal/header',
    icon: FileText,
    iconColor: '#16a34a',
    iconBg: '#dcfce7',
    category: 'INCOME & BANKING',
  },
]
