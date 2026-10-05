export interface GstBusinessFormData {
  // Business Details (matching mobile fields in exact order)
  legalName: string
  tradeName: string
  constitution: string
  /** PAN of the business entity (4th character must match the constitution) */
  businessPan: string
  natureOfBusiness: string
  commencementDate: string
  registrationReason: string
  compositionScheme: string
  placeOfBusiness: string
  businessAddress: string
  city: string
  district: string
  state: string
  pinCode: string
  hsnSacCode: string

  // Bank Details (matching mobile fields in exact order)
  accountHolderName: string
  accountNumber: string
  confirmAccountNumber: string
  ifscCode: string
  bankName: string
  branch: string
  accountType: string

  // Authorised Signatory
  signatoryName: string
  signatoryPan: string
  dob: string
  designation: string
  signatoryMobile: string
  signatoryEmail: string

  // Aadhaar Consent
  aadhaarConsent: boolean
}

// Backward compatibility alias
export type BusinessFormData = GstBusinessFormData
