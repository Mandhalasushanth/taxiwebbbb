import { describe, it, expect } from 'vitest'
import {
  getBusinessDetailsErrors,
  isBusinessDetailsValid,
} from '../../src/modules/itr/components/TdsRefund/TdsRefundCustomerIncome/tdsBusinessValidation'
import { EMPTY_BUSINESS } from '../../src/modules/itr/utils/tdsRefund.constants'

const VALID = { legalName: 'Sharma & Sons Traders Pvt. Ltd.', pan: 'AAACS1234F', aadhaar: '5274 8391 6056', mobile: '9123498765' }

describe('TDS Refund business details validation', () => {
  it('flags every required field when empty', () => {
    const errors = getBusinessDetailsErrors({ ...EMPTY_BUSINESS })
    expect(Object.keys(errors).sort()).toEqual(['aadhaar', 'legalName', 'mobile', 'pan'])
    expect(errors.pan).toBe('Business PAN is required')
  })

  it('rejects an incomplete Aadhaar and an invalid PAN', () => {
    const errors = getBusinessDetailsErrors({ ...VALID, aadhaar: '9994949', pan: 'ABC12' })
    expect(errors.aadhaar).toBeTruthy()
    expect(errors.pan).toBeTruthy()
  })

  it('accepts complete, valid details', () => {
    expect(getBusinessDetailsErrors(VALID)).toEqual({})
    expect(isBusinessDetailsValid(VALID)).toBe(true)
  })
})
