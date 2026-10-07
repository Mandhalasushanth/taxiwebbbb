import { authStorage } from '@core/auth'
import type {
  FindOriginalReturnPayload,
  OriginalReturnDetails,
  RevisionReasonOption,
} from '../types/revisedItr.types'

export const REVISION_REASONS: RevisionReasonOption[] = [
  {
    key: 'missed_income',
    title: 'Missed Income',
    subtitle: 'Income not included in the original return',
    icon: 'income',
  },
  {
    key: 'wrong_deduction',
    title: 'Wrong Deduction',
    subtitle: 'Incorrect or missed deduction',
    icon: 'deduction',
  },
  {
    key: 'incorrect_bank',
    title: 'Incorrect Bank Details',
    subtitle: 'Refund account needs correction',
    icon: 'bank',
  },
  {
    key: 'other',
    title: 'Other',
    subtitle: 'Something else',
    icon: 'other',
  },
]

export const findOriginalReturn = async (
  payload: FindOriginalReturnPayload
): Promise<OriginalReturnDetails> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 350))
    const user = authStorage.getUser()

    return {
      status: 'Verified from IT Portal',
      assessmentYear: payload.assessmentYear,
      itrForm: 'ITR-1',
      grossTotalIncome: '₹8,12,400',
      salaryOriginal: 812400,
      otherOriginal: 0,
      taxableOriginal: 492400,
      deductionsOriginal: 320000,
      taxesPaidOriginal: 31200,
      personalInfo: {
        fullName: user?.fullName || '',
        pan: user?.pan ? `XXXXX${user.pan.slice(-4)}` : '',
        dob: user?.dob || '—',
        mobile: user?.mobile || '—',
        email: user?.email || '—',
        address: user?.addressLine1 ? `${user.addressLine1}, ${user.city || ''}` : '—',
      },
    }
  } catch {
    return {
      status: 'Verified from IT Portal',
      assessmentYear: payload.assessmentYear,
      itrForm: 'ITR-1',
      grossTotalIncome: '₹8,12,400',
      salaryOriginal: 812400,
      otherOriginal: 0,
      taxableOriginal: 492400,
      deductionsOriginal: 320000,
      taxesPaidOriginal: 31200,
      personalInfo: {
        fullName: '',
        pan: '',
        dob: '—',
        mobile: '—',
        email: '—',
        address: '—',
      },
    }
  }
}

export const getRevisionReasons = (): RevisionReasonOption[] => REVISION_REASONS

export const revisedItrService = {
  findOriginalReturn,
  getRevisionReasons,
}
