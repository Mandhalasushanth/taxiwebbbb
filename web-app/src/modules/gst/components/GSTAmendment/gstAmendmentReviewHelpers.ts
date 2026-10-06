import { formatGstFileSize } from '@modules/gst/utils/gstFile'
import type { AmendmentCardItem } from './index'
import type { GSTAmendmentFormData } from '@modules/gst/hooks/useGSTAmendmentFlow'
import { gstProfileService, orNotAvailable } from '@modules/gst/services/gstProfileService'
import {
  getCurrentAddressDetails,
  getCurrentBankDetails,
  getCurrentContactDetails,
  getCurrentSignatoryDetails,
} from '@modules/gst/services/gstProfileDetails'

export interface GSTAmendmentReviewData {
  sectionTitle: string
  isAddressType: boolean
  currentAddress?: {
    address: string
    city: string
    district?: string
    state?: string
    pinCode: string
    natureOfPremises: string
  }
  requestedAddress?: {
    address: string
    city: string
    district?: string
    state?: string
    pinCode: string
    natureOfPremises: string
  }
  currentBank?: { bankName: string; accountNumber: string; ifscCode: string; accountType: string }
  requestedBank?: { bankName: string; accountNumber: string; confirmAccountNumber: string; ifscCode: string; accountType: string }
  currentSig?: { name: string; pan: string; designation: string; mobile: string; email: string }
  requestedSig?: { name: string; designation: string; pan: string; mobile: string; dob: string; email: string }
  currentContact?: { mobile: string; email: string }
  requestedContact?: { mobile: string; email: string }
  reviewGstin: string
  fileName: string
  fileSizeText: string
}

export function buildReviewData(
  selectedOption: AmendmentCardItem,
  formData: GSTAmendmentFormData,
  gstin: string,
  configTitle: string
): GSTAmendmentReviewData {
  const profile = gstProfileService.get()
  const show = orNotAvailable
  const isAddressType = selectedOption.id === 'principal_place' || selectedOption.id === 'additional_place'
  const isAdditional = selectedOption.id === 'additional_place'
  const isBankType = selectedOption.id === 'bank_accounts'
  const isSignatoryType = selectedOption.id === 'authorised_signatories'
  const isContactType = selectedOption.id === 'contact_details'

  const file = formData.file
  const fileSizeText = file ? formatGstFileSize(file.size) : (formData.fileSizeText || show(''))

  const currentAddress = isAddressType ? getCurrentAddressDetails(isAdditional) : undefined

  const userAddr = formData.addressDetails
  const requestedAddress = isAddressType
    ? {
        address: show(userAddr?.address),
        city: show(userAddr?.city),
        district: show(userAddr?.district),
        state: show(userAddr?.state),
        pinCode: show(userAddr?.pinCode),
        natureOfPremises: show(userAddr?.natureOfPremises),
      }
    : undefined

  const userBank = formData.bankDetails || {}
  const currentBank = isBankType ? getCurrentBankDetails() : undefined
  const requestedBank = isBankType
    ? {
        bankName: show(userBank.bankName),
        accountNumber: show(userBank.accountNumber),
        confirmAccountNumber: show(userBank.accountNumber),
        ifscCode: show(userBank.ifscCode),
        accountType: show(userBank.accountType),
      }
    : undefined

  const userSig = formData.signatoryDetails || {}
  const currentSig = isSignatoryType ? getCurrentSignatoryDetails() : undefined
  const requestedSig = isSignatoryType
    ? {
        name: show(userSig.name),
        designation: show(userSig.designation),
        pan: show(userSig.pan),
        mobile: show(userSig.mobile),
        dob: show(userSig.dob),
        email: show(userSig.email),
      }
    : undefined

  const userContact = formData.contactDetails || {}
  const currentContact = isContactType ? getCurrentContactDetails() : undefined
  const requestedContact = isContactType
    ? { mobile: show(userContact.mobile), email: show(userContact.email) }
    : undefined

  return {
    sectionTitle: configTitle,
    isAddressType,
    currentAddress,
    requestedAddress,
    currentBank,
    requestedBank,
    currentSig,
    requestedSig,
    currentContact,
    requestedContact,
    reviewGstin: gstin || show(profile.gstin),
    fileName: file?.name || formData.fileName || show(''),
    fileSizeText,
  }
}
