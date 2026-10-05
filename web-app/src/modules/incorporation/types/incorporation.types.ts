export type CompanyRegistrationTab = 'overview' | 'documents' | 'benefits'

export type CompanyEntityType = 'pvt_ltd' | 'opc' | 'section_8' | 'public_ltd'

export interface CompanyTypeOption {
  id: CompanyEntityType
  title: string
  description: string
  badge: string
  icon: 'building' | 'user' | 'trending' | 'briefcase'
}

export interface CompanyRegistrationDetails {
  title: string
  category: string
  description: string
  overview: {
    heading: string
    content: string
  }
  documents: {
    heading: string
    subheading: string
    items: string[]
  }
  benefits: {
    heading: string
    subheading: string
    items: string[]
  }
}

export interface CompanyDetailsFormData {
  companyType: CompanyEntityType
  classOfCompany: string
  categoryOfCompany: string
  subCategoryOfCompany: string
  primaryBusinessActivity: string
  nicCode: string
  secondaryBusinessActivity: string
  firstPreferredName: string
  secondPreferredName: string
  mandatorySuffix: string
}

export interface DirectorDetails {
  id: number
  fullName: string
  pan: string
  din: string
  dob: string
  fatherName: string
  gender: string
  nationality: string
  designation: string
  category: string
  email: string
  mobile: string
  isResident: boolean
  idProofType?: string
  citizenship?: string
  addressLine1: string
  addressLine2: string
  city: string
  district: string
  state: string
  pincode: string
  isSameAddress: boolean
  equityShares: string
  equityAmount: string
  shareholdingPercent: string
}

export interface RegisteredOfficeAddressData {
  addressLine1: string
  addressLine2?: string
  city: string
  district: string
  state: string
  pincode: string
  email: string
  mobile: string
  ownershipStatus?: string
  policeStation?: string
  jurisdictionRoC?: string
}

export interface OfficeDocItem {
  id: string
  title: string
  subtitle?: string
  isRequired: boolean
  isUploaded: boolean
  fileName?: string
}

export interface RegisteredOfficeFormData {
  addressData: RegisteredOfficeAddressData
  docs?: OfficeDocItem[]
  officeDocs?: OfficeDocItem[]
}


export interface CapitalDetailsFormData {
  authorisedCapital: string
  subscribedCapital: string
  totalShares: string
  faceValue: string
}

export interface KycDocumentItem {
  id: string
  title: string
  subtitle: string
  isRequired: boolean
  isUploaded: boolean
  fileName?: string
}

export interface DocumentsKycFormData {
  promoterDocs: KycDocumentItem[]
  officeDocs: KycDocumentItem[]
  statutoryDocs: KycDocumentItem[]
}

export interface LinkedRegistrationItem {
  id: string
  title: string
  description: string
  checked: boolean
}

export interface TrackingStepItem {
  id: number
  title: string
  desc: string
  dateText?: string
  status: 'completed' | 'active' | 'upcoming'
  statusLabel: string
}

export const ENTITY_TYPE_LABEL_MAP: Record<string, string> = {
  opc: 'One Person Company (OPC)',
  pvt_ltd: 'Private Limited',
  section_8: 'Section 8 (NGO)',
  public_ltd: 'Public Limited',
  public: 'Public Limited Company',
  llp: 'Limited Liability Partnership (LLP)',
  nidhi: 'Nidhi Company',
  producer: 'Producer Company',
}

export const getEntityStructureLabel = (
  type?: string | null,
  options?: { full?: boolean }
): string => {
  if (!type) return 'Private Limited'
  if (options?.full) {
    if (type === 'pvt_ltd') return 'Private Limited Company'
    if (type === 'section_8') return 'Section 8 Company (NGO)'
  }
  return ENTITY_TYPE_LABEL_MAP[type] || 'Private Limited'
}

export const getProposedCompanyName = (
  companyType?: string | null,
  firstPreferredName?: string | null
): string => {
  const defaultName =
    companyType === 'opc'
      ? 'TaxEdge Tech (OPC) Private Limited'
      : 'TaxEdge Tech Private Limited'
  return (firstPreferredName && firstPreferredName.trim()) || defaultName
}

