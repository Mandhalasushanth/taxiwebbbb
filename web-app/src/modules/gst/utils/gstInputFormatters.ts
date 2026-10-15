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
  /** Person names: text only (letters, spaces and . ' -). No numbers or unwanted special characters */
  personName: (v: string, max = 100): string =>
    v.replace(/[^A-Za-z .'-]/g, '').replace(/\s{2,}/g, ' ').slice(0, max),
  /** City and District: text only (letters, spaces and -). No numbers, no special characters */
  cityDistrict: (v: string, max = 50): string =>
    v.replace(/[^A-Za-z -]/g, '').replace(/\s{2,}/g, ' ').slice(0, max),
  /** Branch names: letters, digits, spaces, and . - (e.g. MG Road, Sector 17) */
  branch: (v: string, max = 60): string =>
    v.replace(/[^A-Za-z0-9 .'-]/g, '').replace(/\s{2,}/g, ' ').slice(0, max),
  /** Designation: text only (letters, spaces, / and -). No numbers, no symbols */
  designation: (v: string): string =>
    v.replace(/[^A-Za-z /'-]/g, '').replace(/\s{2,}/g, ' ').slice(0, 60),
  /** Business / trade names: letters, digits and allowed punctuation . & ' - ( ) / , */
  businessName: (v: string): string =>
    v.replace(/[^A-Za-z0-9 .&'()/,-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, 150),
  /** Registered address: letters, numbers, spaces, and address punctuation , . / # ( ) & ' - */
  address: (v: string): string =>
    v.replace(/[^A-Za-z0-9\s,./#()&'-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, 250),
  /** Email: lowercase letters, numbers, and allowed email special characters @ . _ - + */
  email: (v: string): string =>
    v.toLowerCase().replace(/[^a-z0-9@._+-]/g, '').slice(0, 100),
  /** Names, cities, bank names: letters, spaces and . ' - */
  letters: (v: string, max = 100): string =>
    v.replace(/[^A-Za-z .'-]/g, '').replace(/\s{2,}/g, ' ').slice(0, max),
  /** Notice number / RFN / DIN: uppercase letters, numbers, / and -, capped at 20 chars */
  noticeNumber: (v: string): string => v.toUpperCase().replace(/[^A-Z0-9/-]/g, '').slice(0, 20),
  /** GST Application Reference Number (ARN): 15 alphanumeric characters */
  arn: (v: string): string => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15),
  /** Generic reference (capped at 20 chars) */
  reference: (v: string): string => v.toUpperCase().replace(/[^A-Z0-9/-]/g, '').slice(0, 20),
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
  noticeNumber: 20,
  arn: 15,
  reference: 20,
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
    personName: (v: string) => gstInput.personName(v),
    city: (v: string) => gstInput.cityDistrict(v, 50),
    district: (v: string) => gstInput.cityDistrict(v, 50),
    branch: (v: string) => gstInput.branch(v),
    designation: gstInput.designation,
    businessName: gstInput.businessName,
    address: gstInput.address,
    noticeNumber: gstInput.noticeNumber,
    arn: gstInput.arn,
    reference: gstInput.reference,
  } as Record<string, (v: string) => string>)[kind] ?? ((v: string) => gstInput.text(v))
