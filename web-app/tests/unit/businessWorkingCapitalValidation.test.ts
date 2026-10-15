import { describe, expect, it } from 'vitest'
import {
  looksLikeJunk,
  validateStep2BusinessProfile,
  validateStep4Review,
} from '../../src/modules/loans/validation/businessWorkingCapitalValidation'
import { INITIAL_BWC_DATA } from '../../src/modules/loans/components/BusinessWorkingCapital/businessWorkingCapital.constants'

const VALID_STEP2 = {
  ...INITIAL_BWC_DATA,
  businessName: 'Apex Enterprises',
  businessConstitution: 'proprietorship',
  businessActivity: 'trading',
  establishmentDate: '2019-04-01',
  operatingAddress: 'Shop 12, Galaxy Complex, MG Road',
  businessPincode: '560001',
  loanAmount: '10,00,000',
  loanPurpose: 'business-expansion',
  purposeDescription: 'Opening a second outlet to increase sales',
  avgMonthlySales: '8,00,000',
  avgMonthlyExpenses: '5,50,000',
}

describe('Business & Working Capital – stricter validation', () => {
  it('flags keyboard-mash text but accepts real words', () => {
    expect(looksLikeJunk('Gdhdhbcncncn')).toBe(true)
    expect(looksLikeJunk('Cgkjccggg')).toBe(true)
    expect(looksLikeJunk('aaaaaa')).toBe(true)
    expect(looksLikeJunk('Shop 12, Galaxy Complex, MG Road')).toBe(false)
    expect(looksLikeJunk('Apex Enterprises')).toBe(false)
  })

  it('rejects junk address and description', () => {
    const { errors } = validateStep2BusinessProfile({
      ...VALID_STEP2,
      operatingAddress: 'Cgkjccggg',
      purposeDescription: 'Gdhdhbcncncn dhdhdh ncncnc',
    })
    expect(errors.operatingAddress).toBeTruthy()
    expect(errors.purposeDescription).toBeTruthy()
  })

  it('rejects placeholder or invalid Udyam numbers and accepts a real one', () => {
    const check = (udyamNumber: string) => validateStep2BusinessProfile({ ...VALID_STEP2, udyamNumber }).errors.udyamNumber
    expect(check('UDYAM-XX-00-0000000')).toMatch(/state code/)
    expect(check('UDYAM-KA-03-0000000')).toBeTruthy()
    expect(check('UDYAM-KA-03-0012345')).toBeUndefined()
  })

  it('rejects an establishment date before 1900', () => {
    expect(validateStep2BusinessProfile({ ...VALID_STEP2, establishmentDate: '1850-01-01' }).errors.establishmentDate).toBeTruthy()
  })

  it('blocks submit when an earlier step is incomplete, even with the declaration ticked', () => {
    const result = validateStep4Review({ ...INITIAL_BWC_DATA, termsAccepted: true })
    expect(result.isValid).toBe(false)
    expect(result.error).toMatch(/KYC Verification/)
  })
})
