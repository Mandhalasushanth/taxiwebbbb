import { routePaths } from '@core/config'
import { INDIAN_STATE_DROPDOWN_OPTIONS } from '@shared/services/indianStates'
import type { FlowStepItem } from '@shared/components'
import type { VehicleLoanData } from '@modules/loans/types/vehicleLoan.types'
import type { LoanAddress, LoanAddressField } from '@modules/loans/types'

export const VEHICLE_LOAN_TITLE = 'Vehicle Loan'
export const VEHICLE_LOAN_TYPE = 'vehicle_loan'
export const VEHICLE_LOAN_RESUME_ROUTE = routePaths.loansVehicleLoan

export const VEHICLE_LOAN_STEPS: FlowStepItem[] = [
  { stepNumber: 1, title: 'KYC Verification', shortLabel: 'KYC' },
  { stepNumber: 2, title: 'Vehicle & Loan Details', shortLabel: 'Vehicle Details' },
  { stepNumber: 3, title: 'Documents', shortLabel: 'Documents' },
  { stepNumber: 4, title: 'Review & Submit', shortLabel: 'Review' },
  { stepNumber: 5, title: 'Application Submitted', shortLabel: 'Submitted' },
]

export const VEHICLE_LOAN_FORM_STEP_COUNT = 4

export interface VehicleLoanDocConfig {
  id: string
  title: string
  description: string
  isRequired: boolean
  iconType: 'car' | 'file' | 'receipt'
}

export const USED_VEHICLE_REQUIRED_DOCS: readonly VehicleLoanDocConfig[] = [
  {
    id: 'rc_copy',
    title: 'RC Copy',
    description: 'Registration certificate for the used vehicle',
    isRequired: true,
    iconType: 'car',
  },
] as const

export const NEW_VEHICLE_REQUIRED_DOCS: readonly VehicleLoanDocConfig[] = [
  {
    id: 'vehicle_quotation',
    title: 'Vehicle Quotation / Proforma Invoice',
    description: 'Quotation or proforma invoice for the selected new vehicle',
    isRequired: true,
    iconType: 'file',
  },
] as const

export const NEW_VEHICLE_OPTIONAL_DOCS: readonly VehicleLoanDocConfig[] = [
  {
    id: 'booking_receipt',
    title: 'Booking Receipt',
    description: 'Vehicle booking receipt, if available',
    isRequired: false,
    iconType: 'receipt',
  },
] as const

export const isUsedVehicleCondition = (condition?: string): boolean => {
  if (!condition) return false
  const norm = condition.toLowerCase().trim()
  return norm.includes('used') || norm.includes('pre-owned') || norm.includes('old')
}

export const getVehicleLoanDocumentSections = (
  vehicleCondition?: string,
): { requiredDocs: readonly VehicleLoanDocConfig[]; optionalDocs: readonly VehicleLoanDocConfig[] } => {
  if (isUsedVehicleCondition(vehicleCondition)) {
    return {
      requiredDocs: USED_VEHICLE_REQUIRED_DOCS,
      optionalDocs: [],
    }
  }

  return {
    requiredDocs: NEW_VEHICLE_REQUIRED_DOCS,
    optionalDocs: NEW_VEHICLE_OPTIONAL_DOCS,
  }
}

export const VEHICLE_CONDITION_OPTIONS = [
  { value: 'New Vehicle', label: 'New Vehicle' },
  { value: 'Used Vehicle', label: 'Used Vehicle' },
] as const

export const VEHICLE_CATEGORY_OPTIONS = [
  { value: 'Car', label: 'Car' },
  { value: 'Two-Wheeler', label: 'Two-Wheeler' },
  { value: 'Commercial Vehicle', label: 'Commercial Vehicle' },
  { value: 'Other', label: 'Other' },
] as const

export const DEALER_SELECTED_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
] as const

export const PURCHASE_TIMELINE_OPTIONS = [
  { value: 'Within 7 days', label: 'Within 7 days' },
  { value: 'Within 30 days', label: 'Within 30 days' },
  { value: '1–3 months', label: '1–3 months' },
  { value: 'Just exploring', label: 'Just exploring' },
] as const

export const EMPTY_ADDRESS: LoanAddress = {
  houseBuilding: '',
  streetLocality: '',
  city: '',
  pincode: '',
  state: '',
}

export const INITIAL_VEHICLE_LOAN_DATA: VehicleLoanData = {
  // Step 1: KYC Verification
  currentAddress: EMPTY_ADDRESS,
  permanentSameAsCurrent: 'yes',
  permanentAddress: EMPTY_ADDRESS,
  kycConsent: false,

  // Step 2: Vehicle & Loan Details
  requestedLoanAmount: '',
  loanAmount: '',
  vehicleCategory: '',
  repaymentTenure: '',
  vehicleCondition: '',
  vehicleMakeBrand: '',
  vehicleBrand: '',
  vehicleModel: '',
  vehicleMakeModel: '',
  customVehicleMakeModel: '',
  approximateVehiclePrice: '',
  onRoadPrice: '',
  dealerSelected: '',
  dealerName: '',
  purchaseTimeline: '',
  registrationState: '',
  downPayment: '',

  // Step 3: Documents
  uploadedDocs: {},

  // Step 4: Declaration
  termsAccepted: false,
}

export const STATE_OPTIONS = INDIAN_STATE_DROPDOWN_OPTIONS

export const ADDRESS_LIMITS = {
  houseBuilding: 120,
  streetLocality: 150,
  city: 60,
  pincode: 6,
} as const

/** Typing filters: pure functional transforms that sanitize address inputs */
export const ADDRESS_INPUT_FILTERS: Record<LoanAddressField, (value: string) => string> = {
  houseBuilding: (value: string): string =>
    value.replace(/[^A-Za-z0-9 ,./#&()'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.houseBuilding),
  streetLocality: (value: string): string =>
    value.replace(/[^A-Za-z0-9 ,./#&()'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.streetLocality),
  city: (value: string): string =>
    value.replace(/[^A-Za-z .'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, ADDRESS_LIMITS.city),
  pincode: (value: string): string =>
    value.replace(/\D/g, '').slice(0, ADDRESS_LIMITS.pincode),
  state: (value: string): string => value,
}

export interface AddressCopy {
  heading: string
  streetLabel: string
  housePlaceholder: string
  streetPlaceholder: string
  cityPlaceholder: string
  pincodePlaceholder: string
  statePlaceholder: string
}

export const CURRENT_ADDRESS_COPY: AddressCopy = {
  heading: 'Current Address',
  streetLabel: 'Street / Locality / Landmark',
  housePlaceholder: 'e.g. Flat 402, Sunrise Apartments',
  streetPlaceholder: 'e.g. MG Road, Near City Mall',
  cityPlaceholder: 'City / District',
  pincodePlaceholder: '6 digits',
  statePlaceholder: 'Select State',
}

export const PERMANENT_ADDRESS_COPY: AddressCopy = {
  heading: 'Permanent Address',
  streetLabel: 'Street / Locality',
  housePlaceholder: 'e.g. House No. 12',
  streetPlaceholder: 'e.g. Main Road',
  cityPlaceholder: 'City',
  pincodePlaceholder: '6 digits',
  statePlaceholder: 'Select Permanent State',
}

export const KYC_COPY = {
  verifiedTitle: 'Verified Customer Details',
  verifiedBadge: 'Details fetched from KYC',
  verifiedNote: 'Identity information fetched from verified KYC records cannot be edited.',
  addressTitle: 'Address Details',
  addressSubtitle: 'Provide your current communication and permanent address for lender verification.',
  sameAddressQuestion: 'Permanent Address same as Current Address?',
  consentTitle: 'Consent & Authorization',
  consentText:
    'I hereby authorize TaxEdge and its RBI-regulated lending partners to verify my KYC details (PAN & Aadhaar) and fetch my credit records for loan evaluation in compliance with RBI norms and the Digital Personal Data Protection (DPDP) Act.',
  securityNote: '256-bit encryption • Strictly confidential • Never shared without consent',
} as const
