import type { AuthUser } from '@core/auth'

/**
 * Checks whether a profile field has an actual saved value.
 * Valid values such as `0` and `false` are preserved as actual values.
 * Null, undefined, empty strings, and whitespace-only strings are considered missing.
 */
export const isFieldValuePresent = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'boolean') return true
  if (typeof value === 'number') return true
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

/** True for empty names and the generic placeholders the backend returns for unregistered customers */
export const isPlaceholderCustomerName = (name?: string | null): boolean =>
  !name ||
  name.trim() === '' ||
  name.toLowerCase() === 'valued client' ||
  name.toLowerCase() === 'client' ||
  name.toLowerCase() === 'valued' ||
  name.toLowerCase() === 'user' ||
  name.toLowerCase() === 'guest' ||
  name.toLowerCase() === 'guest user' ||
  name.toLowerCase().startsWith('user (')

/**
 * Resolves the Customer ID following the unified platform rule:
 * - If profile is complete: Permanent Customer ID (e.g. TX-650681 or user.id)
 * - If profile is incomplete: Temporary Customer ID derived from the last 6 digits of mobile (TX-<last 6 digits>)
 */
export const getCustomerId = (user: AuthUser | null | undefined): string => {
  if (!user) return ''
  const isProfileComplete = Boolean(
    user.isProfileComplete &&
    user.fullName &&
    !isPlaceholderCustomerName(user.fullName)
  )
  const mobileDigits = (user.mobile || '').replace(/\D/g, '')
  const last6Digits = mobileDigits.slice(-6)

  if (isProfileComplete) {
    return user.id ? user.id.replace(/^usr_/i, 'TX-').toUpperCase() : 'N/A'
  }
  return last6Digits ? `TX-${last6Digits}` : 'Profile setup pending'
}

/**
 * Resolves the display name following the unified platform rule:
 * - If profile is complete: actual full name
 * - If profile is incomplete: Guest User
 */
export const getCustomerDisplayName = (user: AuthUser | null | undefined): string => {
  if (!user) return 'Guest User'
  const isProfileComplete = Boolean(
    user.isProfileComplete &&
    user.fullName &&
    !isPlaceholderCustomerName(user.fullName)
  )
  if (isProfileComplete && user.fullName) {
    return user.fullName
  }
  return 'Guest User'
}

/** True for empty emails and auto-generated backend mock emails (e.g. 9876543210@taxedge.in) */
export const isMockEmail = (email?: string | null): boolean => {
  if (!email || email.trim() === '') return true
  return /^\d{10}@taxedge\.in$/i.test(email.trim()) || email.toLowerCase().endsWith('@taxedge.in')
}

/** Compact currency formatting matching the mobile app */
export const compactRupees = (value: number): string =>
  value >= 100000
    ? `₹${(value / 100000).toFixed(1)}L`
    : value >= 1000
      ? `₹${(value / 1000) % 1 === 0 ? value / 1000 : (value / 1000).toFixed(1)}K`
      : `₹${value}`

export interface ProfileProgressResult {
  percentage: number
  completedCount: number
  totalCount: number
  missingFields: string[]
  isFullyComplete: boolean
}

/**
 * Calculates profile completion progress dynamically based on actual profile data
 * and applicable account verification requirements.
 *
 * Requirements for a standard customer profile:
 * 1. Mobile verification (satisfied upon OTP verification at registration)
 * 2. Personal identity (Full Name & Email Address)
 * 3. Demographics (Gender & Date of Birth)
 * 4. KYC Identity (PAN & Aadhaar)
 * 5. Residential Address (Address Line 1 / Address, City, State, and Pincode)
 *
 * For a newly registered user with only mobile verified, this dynamically evaluates to 20%.
 * If mandatory information or required verification remains incomplete, 100% is never shown.
 */
export const calculateProfileProgress = (
  user: AuthUser | null | undefined
): ProfileProgressResult => {
  const totalCount = 5

  if (!user) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount,
      missingFields: ['mobile', 'personal', 'demographics', 'kyc', 'address'],
      isFullyComplete: false,
    }
  }

  // 1. Mobile Number (Verified via registration OTP)
  const isMobileVerified = isFieldValuePresent(user.mobile)

  // 2. Personal Info: Full Name and Email (excluding placeholders / auto-generated mock emails)
  const hasValidName =
    isFieldValuePresent(user.fullName) && !isPlaceholderCustomerName(user.fullName)
  const hasValidEmail =
    isFieldValuePresent(user.email) && !isMockEmail(user.email)
  const isPersonalInfoComplete = hasValidName && hasValidEmail

  // 3. Demographics: Gender and Date of Birth
  const isDemographicsComplete =
    isFieldValuePresent(user.gender) && isFieldValuePresent(user.dob)

  // 4. KYC: PAN and Aadhaar
  const isKycComplete =
    isFieldValuePresent(user.pan) && isFieldValuePresent(user.aadhaar)

  // 5. Residential Address: Address Line 1 / Address, City, State, Pincode
  const hasStreet =
    isFieldValuePresent(user.addressLine1) || isFieldValuePresent(user.address)
  const isAddressComplete =
    hasStreet &&
    (isFieldValuePresent(user.city) || isFieldValuePresent(user.district)) &&
    isFieldValuePresent(user.state) &&
    isFieldValuePresent(user.pincode)

  const checks = [
    { key: 'mobile', completed: isMobileVerified },
    { key: 'personal', completed: isPersonalInfoComplete },
    { key: 'demographics', completed: isDemographicsComplete },
    { key: 'kyc', completed: isKycComplete },
    { key: 'address', completed: isAddressComplete },
  ]

  const completedCount = checks.filter((c) => c.completed).length
  const missingFields = checks.filter((c) => !c.completed).map((c) => c.key)

  const remainingChecks = [isPersonalInfoComplete, isDemographicsComplete, isKycComplete, isAddressComplete]
  const completedRemaining = remainingChecks.filter(Boolean).length

  // Initial base progress starts at 50% for newly registered users, progressing to 100%
  let percentage = 50 + Math.round((completedRemaining / 4) * 50)
  if (!isMobileVerified) {
    percentage = 0
  }

  // Explicit safety rule: do not show 100% when mandatory information or verification remains incomplete
  const allChecksSatisfied = completedCount === totalCount
  if (percentage >= 100 && (!user.isProfileComplete || !allChecksSatisfied)) {
    percentage = 90
  }

  const isFullyComplete = Boolean(user.isProfileComplete && allChecksSatisfied)

  return {
    percentage,
    completedCount,
    totalCount,
    missingFields,
    isFullyComplete,
  }
}

/** Formats customer entity type for display, e.g. "individual" -> "Individual" */
export const formatCustomerType = (type?: string | null): string | null => {
  if (!isFieldValuePresent(type)) return null
  const clean = String(type).trim().toLowerCase()
  switch (clean) {
    case 'individual':
      return 'Individual'
    case 'salaried':
      return 'Salaried'
    case 'business':
      return 'Business'
    case 'freelancer':
      return 'Freelancer'
    case 'proprietorship':
      return 'Proprietorship'
    case 'partnership':
      return 'Partnership'
    case 'llp':
      return 'LLP'
    case 'pvtltd':
    case 'private_limited':
      return 'Private Limited'
    case 'public_limited':
    case 'company':
      return 'Public Limited'
    case 'huf':
      return 'HUF'
    case 'aop_boi':
    case 'aop/boi':
      return 'AOP / BOI'
    case 'ngo_trust':
    case 'ngo/trust':
      return 'NGO / Trust'
    default:
      return clean.charAt(0).toUpperCase() + clean.slice(1)
  }
}

/** Formats gender for display, e.g. "male" -> "Male" */
export const formatGender = (gender?: string | null): string | null => {
  if (!isFieldValuePresent(gender)) return null
  const clean = String(gender).trim().toLowerCase()
  switch (clean) {
    case 'male':
      return 'Male'
    case 'female':
      return 'Female'
    case 'other':
      return 'Other'
    default:
      return clean.charAt(0).toUpperCase() + clean.slice(1)
  }
}

/** Formats residential address into a single readable summary string */
export const formatFullAddress = (user?: AuthUser | null): string | null => {
  if (!user) return null

  // If already consolidated
  if (isFieldValuePresent(user.address)) {
    return String(user.address).trim()
  }

  const parts = [
    user.addressLine1,
    user.addressLine2,
    user.areaLocality,
    user.city || user.district,
    user.state,
    user.pincode,
  ]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)

  if (parts.length === 0) return null
  return parts.join(', ')
}
