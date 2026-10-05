import { formatIfsc, formatMobile, formatPan } from '@shared/utils'

/**
 * Input filters for GST forms: applied in onChange so users can only type
 * characters that are valid for the field.
 */
export const gstInput = {
  gstin: (v: string): string => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15),
  pan: formatPan,
  ifsc: formatIfsc,
  mobile: formatMobile,
  pinCode: (v: string): string => v.replace(/\D/g, '').slice(0, 6),
  accountNumber: (v: string): string => v.replace(/\D/g, '').slice(0, 18),
  /** HSN / SAC codes are numeric only (4, 6 or 8 digits) */
  hsnSac: (v: string): string => v.replace(/\D/g, '').slice(0, 8),
  /** Names, cities, bank names: letters, spaces and . ' - & ( ) */
  letters: (v: string, max = 100): string => v.replace(/[^A-Za-z .'&()-]/g, '').replace(/\s{2,}/g, ' ').slice(0, max),
  /** Designation also allows "/" e.g. "Partner / Director" */
  designation: (v: string): string => v.replace(/[^A-Za-z .&/'-]/g, '').replace(/\s{2,}/g, ' ').slice(0, 60),
  /** Business / trade names: letters, digits and . & ' - ( ) / , */
  businessName: (v: string): string =>
    v.replace(/[^A-Za-z0-9 .&'()/,-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, 150),
  address: (v: string): string => v.replace(/\s{2,}/g, ' ').trimStart().slice(0, 250),
  email: (v: string): string => v.replace(/\s/g, '').toLowerCase().slice(0, 100),
  /** Notice number / ARN / reference */
  reference: (v: string): string => v.toUpperCase().replace(/[^A-Z0-9/-]/g, '').slice(0, 35),
  amount: (v: string): string => {
    const digits = v.replace(/\D/g, '').slice(0, 13)
    return digits ? Number(digits).toLocaleString('en-IN') : ''
  },
  text: (v: string, max = 500): string => v.slice(0, max),
}

/** Max lengths matching the filters above (for the maxLength attribute) */
export const GST_MAX_LENGTH = {
  gstin: 15,
  pan: 10,
  ifsc: 11,
  mobile: 10,
  pinCode: 6,
  accountNumber: 18,
  hsnSac: 8,
  name: 100,
  email: 100,
  reference: 35,
  address: 250,
} as const

/** Input filter for a field identified by its kind (see detectGstFieldKind) */
export const gstInputForKind = (kind: string): ((v: string) => string) =>
  ({
    gstin: gstInput.gstin,
    pan: gstInput.pan,
    ifsc: gstInput.ifsc,
    email: gstInput.email,
    mobile: gstInput.mobile,
    pinCode: gstInput.pinCode,
    accountNumber: gstInput.accountNumber,
    personName: (v: string) => gstInput.letters(v),
    businessName: gstInput.businessName,
    address: gstInput.address,
    reference: gstInput.reference,
  } as Record<string, (v: string) => string>)[kind] ?? ((v: string) => gstInput.text(v))
