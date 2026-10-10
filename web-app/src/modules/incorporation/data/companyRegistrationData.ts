import type {
  CompanyRegistrationDetails,
  CompanyTypeOption,
  CompanyDetailsFormData,
  DirectorDetails,
} from '../types/incorporation.types'

export const companyRegistrationData: CompanyRegistrationDetails = {
  title: 'Company Registration',
  category: 'Business & Incorporation Category',
  description:
    'Incorporate your Private Limited, One Person Company (OPC), Section 8 (NGO), or Public Limited Company end-to-end with TaxEdge CA assistance.',
  overview: {
    heading: 'Service Overview',
    content:
      'TaxEdge Fin Solutions provides end-to-end corporate incorporation assistance for MCA, ROC, and statutory authorities. Our compliance team verifies director credentials, checks name availability, drafts e-MoA / e-AoA, and files SPICe+ Part A & Part B directly on the Ministry of Corporate Affairs portal.',
  },
  documents: {
    heading: 'Required Documents',
    subheading: 'You will need to upload digital copies of these documents during application:',
    items: [
      'PAN Card of all Directors / Promoters',
      'Aadhaar Card / Passport of all Directors',
      'Registered Office Ownership / Lease Proof',
      'Utility Bill (Electricity / Water not older than 2 months)',
      'Property Owner No Objection Certificate (NOC)',
    ],
  },
  benefits: {
    heading: 'Benefits & Advantages',
    subheading: 'Why choose TaxEdge Fin Solutions:',
    items: [
      '100% Digital MCA Incorporation & Government Portal Filing',
      'Includes RUN / SPICe+ Part A & Part B Submission',
      'Dedicated CA Expert & Compliance Verification Officer',
      'Free PAN, TAN, EPFO, ESIC & Corporate Bank Account Setup',
      'Transparent Itemized MCA Statutory Fee Breakdown',
    ],
  },
}

/** 3D icon image paths stored in public/assets/icons/incorporation/ */
/** Types without a 3D image fall back to their inline line icon */
export const COMPANY_TYPE_ICON_IMAGE_MAP: Partial<Record<CompanyTypeOption['id'], string>> = {
  pvt_ltd: '/assets/icons/incorporation/pvt-ltd.png',
  opc: '/assets/icons/incorporation/opc.png',
  section_8: '/assets/icons/incorporation/section-8.png',
  public_ltd: '/assets/icons/incorporation/public-ltd.png',
}

export const companyTypeOptions: CompanyTypeOption[] = [
  {
    id: 'pvt_ltd',
    title: 'Private Limited Company (Pvt Ltd)',
    description: 'Suitable for startups and growing businesses. Limited liability & easy funding.',
    badge: 'Min 2 Directors',
    icon: 'building',
    image: COMPANY_TYPE_ICON_IMAGE_MAP.pvt_ltd,
  },
  {
    id: 'llp',
    title: 'Limited Liability Partnership (LLP)',
    description: 'Best for partners and professional firms. Limited liability with low compliance overhead.',
    badge: 'Min 2 Designated Partners',
    icon: 'partners',
  },
  {
    id: 'opc',
    title: 'One Person Company (OPC)',
    description: 'Ideal for solo entrepreneurs who want corporate identity with 100% ownership control.',
    badge: '1 Founder + 1 Nominee',
    icon: 'user',
    image: COMPANY_TYPE_ICON_IMAGE_MAP.opc,
  },
  {
    id: 'section_8',
    title: 'Section 8 Company (Non-Profit)',
    description: 'Formed for promoting commerce, art, science, sports, education, research, or charity.',
    badge: 'Min 2 Members',
    icon: 'trending',
    image: COMPANY_TYPE_ICON_IMAGE_MAP.section_8,
  },
  {
    id: 'public_ltd',
    title: 'Public Limited Company',
    description: 'Suitable for large scale enterprises planning to list shares or issue public capital.',
    badge: 'Min 2 Directors',
    icon: 'briefcase',
    image: COMPANY_TYPE_ICON_IMAGE_MAP.public_ltd,
  },
]

export const defaultCompanyDetails: CompanyDetailsFormData = {
  companyType: 'pvt_ltd',
  classOfCompany: '',
  categoryOfCompany: '',
  subCategoryOfCompany: '',
  primaryBusinessActivity: '',
  nicCode: '',
  secondaryBusinessActivity: '',
  firstPreferredName: '',
  secondPreferredName: '',
  mandatorySuffix: '',
}

export const defaultDirectors: DirectorDetails[] = [
  {
    id: 1,
    fullName: '',
    pan: '',
    din: '',
    dob: '',
    fatherName: '',
    gender: '',
    nationality: 'Indian',
    designation: '',
    category: 'Promoter Director',
    email: '',
    mobile: '',
    isResident: true,
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    isSameAddress: true,
    equityShares: '',
    equityAmount: '',
    shareholdingPercent: '',
  },
]
