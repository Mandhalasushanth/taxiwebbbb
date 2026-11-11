/**
 * Centralized Validation Error Messages for Finsolz Application
 * SINGLE SOURCE OF TRUTH for all validation error copy.
 */

export const VALIDATION_MESSAGES = {
  required: 'This field is required.',
  name: 'Please enter a valid name using only letters, spaces and dots.',
  email: 'Please enter a valid email address.',
  mobile: 'Please enter a valid 10-digit mobile number.',
  dob: 'Please enter a valid date of birth.',
  futureDob: 'Date of birth cannot be in the future.',
  pan: 'Please enter a valid 10-character PAN number.',
  panCategory: 'The 4th character of PAN must represent a valid entity type (A, B, C, F, G, H, J, L, P, or T).',
  panMismatch: 'PAN category does not match the selected business type.',
  panIndividual: 'Signatory PAN must be an individual PAN (4th character "P").',
  aadhaar: 'Please enter a valid 12-digit Aadhaar number.',
  address: 'Please enter a valid address.',
  city: 'Please enter a valid city name.',
  pincode: 'Please enter a valid 6-digit PIN code.',
  gstin: 'Please enter a valid GSTIN.',
  accountNumber: 'Please enter a valid bank account number.',
  ifsc: 'Please enter a valid 11-character IFSC code.',
} as const

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES
