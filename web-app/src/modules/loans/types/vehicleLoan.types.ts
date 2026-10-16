import type { LoanAddress, YesNoChoice } from '@modules/loans/types'

export type VehicleCondition = 'New Vehicle' | 'Used Vehicle' | 'Pre-Owned / Used Vehicle' | ''

export type VehicleCategory =
  | 'Car'
  | 'Two-Wheeler'
  | 'Commercial Vehicle'
  | 'Other'
  | 'New Car (Passenger)'
  | 'Pre-Owned / Used Car'
  | 'Electric Vehicle (EV - 2W / 4W)'
  | 'Two-Wheeler / Superbike'
  | 'Commercial Vehicle / Truck'
  | 'Fleet Purchase'
  | 'Balance Transfer & Top-Up'
  | 'Others'
  | ''

export type VehicleDealerSelected = 'Yes' | 'No' | ''

export type VehiclePurchaseTimeline =
  | 'Within 7 days'
  | 'Within 30 days'
  | '1–3 months'
  | 'Just exploring'
  | ''

export interface VehicleLoanStepProps {
  data: VehicleLoanData
  onChange: (patch: Partial<VehicleLoanData>) => void
  errors?: Record<string, string>
}

export type VehicleRepaymentTenure =
  | '3 M (3 Months)'
  | '6 M (6 Months)'
  | '9 M (9 Months)'
  | '12 M (1 Yr)'
  | '18 M (1.5 Yrs)'
  | '24 M (2 Yrs)'
  | '36 M (3 Yrs)'
  | '48 M (4 Yrs)'
  | '60 M (5 Yrs)'
  | '72 M (6 Yrs)'
  | '84 M (7 Yrs)'
  | 'Other / Custom Tenure'

export type VehicleMakeModel =
  | 'Maruti Suzuki Swift'
  | 'Maruti Suzuki Baleno'
  | 'Maruti Suzuki Brezza'
  | 'Maruti Suzuki Ertiga'
  | 'Hyundai Creta'
  | 'Hyundai Venue'
  | 'Hyundai i20'
  | 'Hyundai Verna'
  | 'Tata Nexon'
  | 'Tata Punch'
  | 'Tata Harrier / Safari'
  | 'Tata Nexon EV'
  | 'Mahindra Thar'
  | 'Mahindra Scorpio-N'
  | 'Mahindra XUV700'
  | 'Kia Seltos'
  | 'Kia Sonet'
  | 'Toyota Innova Crysta / Hycross'
  | 'Toyota Fortuner'
  | 'Honda City / Elevate'
  | 'Electric: MG ZS EV / Ola S1 / Ather 450X'
  | 'Two-Wheeler: Honda Activa / TVS Jupiter'
  | 'Two-Wheeler: Royal Enfield / Bajaj Pulsar'
  | 'Commercial: Tata Ace / Mahindra Bolero Pik-Up'
  | 'Other (Specify Custom Vehicle Model)'

export interface VehicleLoanData {
  // Step 1: KYC Verification
  currentAddress: LoanAddress
  permanentSameAsCurrent: YesNoChoice
  permanentAddress: LoanAddress
  kycConsent: boolean

  // Step 2: Vehicle & Loan Details
  requestedLoanAmount?: string
  loanAmount: string | number
  vehicleCategory: VehicleCategory
  repaymentTenure?: VehicleRepaymentTenure | ''
  vehicleCondition: VehicleCondition
  vehicleMakeBrand?: string
  vehicleBrand?: string
  vehicleModel?: string
  vehicleMakeModel?: string
  customVehicleMakeModel?: string
  approximateVehiclePrice?: string | number
  onRoadPrice: string | number
  dealerSelected?: VehicleDealerSelected
  dealerName?: string
  purchaseTimeline?: VehiclePurchaseTimeline
  registrationState?: string
  downPayment?: string | number

  // Step 3: Documents
  uploadedDocs?: Record<string, { name: string; size: string; file?: File; uploadedAt: string }>

  // Step 4: Review & Declaration
  termsAccepted: boolean
}

