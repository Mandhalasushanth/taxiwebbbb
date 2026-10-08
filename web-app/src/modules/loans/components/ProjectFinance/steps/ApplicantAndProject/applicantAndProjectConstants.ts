import { INDIAN_STATE_DROPDOWN_OPTIONS } from '@shared/services/indianStates'

export const ENTITY_TYPES = [
  { label: 'Private Limited', value: 'Private Limited' },
  { label: 'Public Limited', value: 'Public Limited' },
  { label: 'Limited Liability Partnership (LLP)', value: 'Limited Liability Partnership (LLP)' },
  { label: 'Partnership Firm', value: 'Partnership Firm' },
  { label: 'Proprietorship', value: 'Proprietorship' },
  { label: 'Special Purpose Vehicle (SPV)', value: 'Special Purpose Vehicle (SPV)' },
  { label: 'Joint Venture', value: 'Joint Venture' },
]

export const BANKING_RELATIONSHIPS = [
  { label: 'Existing Borrower', value: 'Existing Borrower' },
  { label: 'Savings Account Holder', value: 'Savings Account Holder' },
  { label: 'Current Account Holder', value: 'Current Account Holder' },
  { label: 'Fixed Deposit Customer', value: 'Fixed Deposit Customer' },
  { label: 'New Customer', value: 'New Customer' },
]

export const PRIMARY_BUSINESS_ACTIVITIES = [
  { label: 'Manufacturing & Industrial', value: 'Manufacturing & Industrial' },
  { label: 'Renewable Energy & Power', value: 'Renewable Energy & Power' },
  { label: 'Infrastructure & Construction', value: 'Infrastructure & Construction' },
  { label: 'Commercial Real Estate', value: 'Commercial Real Estate' },
  { label: 'Logistics & Warehousing', value: 'Logistics & Warehousing' },
  { label: 'Healthcare & Pharma', value: 'Healthcare & Pharma' },
  { label: 'Hospitality & Tourism', value: 'Hospitality & Tourism' },
  { label: 'IT & Data Centers', value: 'IT & Data Centers' },
]

export const PROJECT_SECTORS = [
  { label: 'Energy & Power', value: 'Energy & Power' },
  { label: 'Transportation & Infra', value: 'Transportation & Infra' },
  { label: 'Industrial Manufacturing', value: 'Industrial Manufacturing' },
  { label: 'Commercial Real Estate', value: 'Commercial Real Estate' },
  { label: 'Healthcare & Life Sciences', value: 'Healthcare & Life Sciences' },
  { label: 'Water & Waste Management', value: 'Water & Waste Management' },
]

export const SECTOR_SUBSECTORS: Record<string, { label: string; value: string }[]> = {
  'Energy & Power': [
    { label: 'Solar PV', value: 'Solar PV' },
    { label: 'Wind Energy', value: 'Wind Energy' },
    { label: 'Hydro Electric', value: 'Hydro Electric' },
    { label: 'Thermal Power', value: 'Thermal Power' },
    { label: 'Green Hydrogen', value: 'Green Hydrogen' },
  ],
  'Transportation & Infra': [
    { label: 'Highways & Toll Roads', value: 'Highways & Toll Roads' },
    { label: 'Ports & Logistics Terminals', value: 'Ports & Logistics Terminals' },
    { label: 'Metros & Urban Transit', value: 'Metros & Urban Transit' },
    { label: 'Airports & Aviation', value: 'Airports & Aviation' },
  ],
  'Industrial Manufacturing': [
    { label: 'Steel & Metals Processing', value: 'Steel & Metals Processing' },
    { label: 'Automobile & EV Components', value: 'Automobile & EV Components' },
    { label: 'Chemicals & Petrochemicals', value: 'Chemicals & Petrochemicals' },
    { label: 'Heavy Engineering', value: 'Heavy Engineering' },
  ],
  'Commercial Real Estate': [
    { label: 'IT Parks & SEZ Campuses', value: 'IT Parks & SEZ Campuses' },
    { label: 'Retail Malls & Mixed-Use', value: 'Retail Malls & Mixed-Use' },
    { label: 'Hospitality & Hotels', value: 'Hospitality & Hotels' },
    { label: 'Warehousing Parks', value: 'Warehousing Parks' },
  ],
  'Healthcare & Life Sciences': [
    { label: 'Multi-Specialty Hospitals', value: 'Multi-Specialty Hospitals' },
    { label: 'Pharma & Biotech Plants', value: 'Pharma & Biotech Plants' },
    { label: 'Medical Devices Hubs', value: 'Medical Devices Hubs' },
  ],
  'Water & Waste Management': [
    { label: 'Desalination Plants', value: 'Desalination Plants' },
    { label: 'Sewage Treatment (STP)', value: 'Sewage Treatment (STP)' },
    { label: 'Solid Waste & Effluent Processing', value: 'Solid Waste & Effluent Processing' },
  ],
}

export const PROJECT_TYPES = [
  { label: 'Greenfield Project', value: 'Greenfield Project' },
  { label: 'Brownfield Expansion', value: 'Brownfield Expansion' },
  { label: 'Modernization & Upgradation', value: 'Modernization & Upgradation' },
  { label: 'Debt Refinancing', value: 'Debt Refinancing' },
]

export const DEVELOPMENT_OPTIONS = [
  { label: 'Greenfield', value: 'Greenfield' },
  { label: 'Expansion', value: 'Expansion' },
  { label: 'Modernization', value: 'Modernization' },
  { label: 'Diversification', value: 'Diversification' },
]

export const STATES_LIST = INDIAN_STATE_DROPDOWN_OPTIONS

export const DISTRICTS_MAP: Record<string, { label: string; value: string }[]> = {
  Gujarat: [
    { label: 'Ahmedabad', value: 'Ahmedabad' },
    { label: 'Surat', value: 'Surat' },
    { label: 'Vadodara', value: 'Vadodara' },
    { label: 'Rajkot', value: 'Rajkot' },
    { label: 'Gandhinagar', value: 'Gandhinagar' },
  ],
  Maharashtra: [
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'Pune', value: 'Pune' },
    { label: 'Nagpur', value: 'Nagpur' },
    { label: 'Nashik', value: 'Nashik' },
  ],
  Telangana: [
    { label: 'Hyderabad', value: 'Hyderabad' },
    { label: 'Rangareddy', value: 'Rangareddy' },
    { label: 'Medchal', value: 'Medchal' },
    { label: 'Warangal', value: 'Warangal' },
  ],
  Karnataka: [
    { label: 'Bengaluru', value: 'Bengaluru' },
    { label: 'Mysuru', value: 'Mysuru' },
    { label: 'Mangaluru', value: 'Mangaluru' },
  ],
}
