import { getApplicantIdentityDetails } from '@modules/loans/services/applicantDetailsService'
import type { VerifiedCustomerDetails } from '@modules/loans/types/businessWorkingCapital.types'

/** Identity from the signed-in account's verified KYC */
export const loadVerifiedCustomer = (): VerifiedCustomerDetails => {
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
}
