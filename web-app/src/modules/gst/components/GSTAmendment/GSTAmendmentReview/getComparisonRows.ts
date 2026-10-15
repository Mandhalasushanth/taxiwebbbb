import { orNotAvailable } from '@modules/gst/services/gstProfileService'
import type { AddressDetailsItem, BankDetailsItem, ContactDetailsItem, SignatoryDetailsItem } from './GSTAmendmentReview'

export interface RowItem {
  label: string
  value: string
}

export function getBankRows(details: BankDetailsItem, isRequested: boolean): RowItem[] {
  const displayAccountNumber =
    isRequested && details.accountNumber && details.accountNumber.length > 4
      ? `XXXX${details.accountNumber.slice(-4)}`
      : details.accountNumber

  return [
    { label: 'Bank Name', value: details.bankName },
    { label: 'Account Number', value: displayAccountNumber },
    { label: 'IFSC Code', value: details.ifscCode },
    { label: 'Account Type', value: details.accountType },
  ]
}

export function getAddressRows(
  details: AddressDetailsItem,
  isAdditional: boolean,
  isRequested: boolean
): RowItem[] {
  const rows: RowItem[] = [
    {
      label: isRequested ? (isAdditional ? 'Additional Place Address' : 'Business Address') : 'Address',
      value: details.address,
    },
    { label: 'City', value: details.city },
  ]

  if (!isAdditional && details.district) {
    rows.push({ label: 'District', value: details.district })
  }

  if (!isAdditional && details.state) {
    rows.push({ label: isRequested ? 'State / UT' : 'State', value: details.state })
  }

  rows.push(
    { label: 'PIN Code', value: details.pinCode },
    { label: 'Nature of Premises', value: details.natureOfPremises || (isRequested ? 'Shared' : 'Warehouse') }
  )

  return rows
}

export function getSignatoryRows(details: SignatoryDetailsItem, isRequested: boolean): RowItem[] {
  if (isRequested) {
    let displayDob = details.dob || orNotAvailable('')
    if (details.dob && /^\d{4}-\d{2}-\d{2}$/.test(details.dob)) {
      const [year, month, day] = details.dob.split('-')
      displayDob = `${day}-${month}-${year}`
    }

    const displayMobile = details.mobile ? details.mobile.replace(/^\+91\s*/, '') : ''

    return [
      { label: 'Signatory Name', value: details.name },
      { label: 'Signatory PAN', value: details.pan },
      { label: 'Date of Birth', value: displayDob },
      { label: 'Designation', value: details.designation },
      { label: 'Signatory Mobile', value: displayMobile },
      { label: 'Signatory Email', value: details.email },
    ]
  }

  return [
    { label: 'Name', value: details.name },
    { label: 'PAN', value: details.pan },
    { label: 'Designation', value: details.designation },
    { label: 'Mobile', value: details.mobile },
    { label: 'Email', value: details.email },
  ]
}

export function getContactRows(details: ContactDetailsItem): RowItem[] {
  const displayMobile = details.mobile ? details.mobile.replace(/^\+91\s*/, '') : ''
  return [
    { label: 'Mobile Number', value: displayMobile },
    { label: 'Email Address', value: details.email },
  ]
}

