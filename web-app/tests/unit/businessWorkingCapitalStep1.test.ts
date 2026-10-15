process.env.VITE_API_BASE_URL = 'http://localhost:3000'

import { describe, expect, it } from 'vitest'
import { validateStep1KycVerification } from '../../src/modules/loans/validation/businessWorkingCapitalValidation'
import { INITIAL_BWC_DATA } from '../../src/modules/loans/components/BusinessWorkingCapital/businessWorkingCapital.constants'

const VALID_ADDRESS = {
  houseBuilding: 'Flat 402, Sunrise Apartments',
  streetLocality: 'MG Road, Near City Mall',
  city: 'Hyderabad',
  pincode: '500001',
  state: 'Telangana',
}

const valid = { ...INITIAL_BWC_DATA, currentAddress: VALID_ADDRESS, kycConsent: true }

describe('Business & Working Capital – Step 1 KYC', () => {
  it('passes with a valid current address, same permanent address and consent', () => {
    expect(validateStep1KycVerification(valid).isValid).toBe(true)
  })

  it('requires every current address field and consent', () => {
    const { errors } = validateStep1KycVerification(INITIAL_BWC_DATA)
    expect(Object.keys(errors).sort()).toEqual([
      'currentAddress.city',
      'currentAddress.houseBuilding',
      'currentAddress.pincode',
      'currentAddress.state',
      'currentAddress.streetLocality',
      'kycConsent',
    ])
  })

  it('rejects a PIN code that does not belong to the selected state', () => {
    const { errors } = validateStep1KycVerification({ ...valid, currentAddress: { ...VALID_ADDRESS, state: 'Bihar' } })
    expect(errors['currentAddress.pincode']).toBeTruthy()
  })

  it('validates the permanent address only when it differs', () => {
    const { errors } = validateStep1KycVerification({ ...valid, permanentSameAsCurrent: 'no' })
    expect(errors['permanentAddress.houseBuilding']).toBeTruthy()
    expect(errors['permanentAddress.state']).toBeTruthy()
  })
})
