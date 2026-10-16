import { getApplicantIdentityDetails } from '@modules/loans/services/applicantDetailsService'
import type { VerifiedCustomerDetails } from '@modules/loans/types'

/** Identity loaded from the signed-in account's verified KYC */
export const loadVerifiedCustomer = (): VerifiedCustomerDetails => {
  try {
    const applicant = getApplicantIdentityDetails()
    return {
      fullName: applicant.name,
      mobile: applicant.mobile,
      email: applicant.email,
      pan: applicant.pan,
      aadhaar: applicant.aadhaar,
      dob: applicant.dob,
      isVerified: applicant.isVerified,
    }
  } catch (err) {
    console.error('Error fetching applicant identity details', err)
    return {
      fullName: '',
      mobile: '',
      email: '',
      pan: '',
      aadhaar: '',
      dob: '',
      isVerified: false,
    }
  }
}

export default loadVerifiedCustomer
