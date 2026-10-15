import { authStorage } from '@core/auth'
import { useAuthStore } from '@store/index'
import type { ApplicantIdentityProfile } from '@modules/loans/types/loanApplication.types'

/**
 * Default empty applicant profile when no account session is active
 */
const EMPTY_APPLICANT_PROFILE: ApplicantIdentityProfile = {
  name: '',
  mobile: '',
  email: '',
  pan: '',
  aadhaar: '',
  dob: '',
  address: '',
  isVerified: true,
}

/**
 * Builds an address string from its parts, preferring a full address when present
 */
function composeAddress(
  address?: string,
  line1?: string,
  city?: string,
  state?: string,
  pincode?: string
): string {
  if (address && address.trim()) return address.trim()
  const base = [line1, city, state].filter(Boolean).join(', ')
  return pincode ? (base ? `${base} - ${pincode}` : pincode) : base
}

/**
 * Securely retrieves applicant details from the logged-in session or stored profile
 */
export function getApplicantIdentityDetails(): ApplicantIdentityProfile {
  try {
    const storeUser = useAuthStore.getState().user
    const storageUser = authStorage.getUser()
    const user = storeUser || storageUser

    return !user
      ? EMPTY_APPLICANT_PROFILE
      : {
          name: user.fullName || '',
          mobile: user.mobile || '',
          email: user.email || '',
          pan: user.pan || '',
          aadhaar: user.aadhaar || '',
          dob: user.dob || '',
          address: composeAddress(
            user.address,
            user.addressLine1,
            user.city,
            user.state,
            user.pincode
          ),
          isVerified: Boolean(user.isProfileComplete || user.pan || user.aadhaar),
        }
  } catch {
    // Stored session data could not be read; show an empty profile
    return EMPTY_APPLICANT_PROFILE
  }
}
