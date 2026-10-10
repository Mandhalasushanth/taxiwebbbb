import { describe, it, expect } from 'vitest'
import { computeTdsEstimate } from '../../src/modules/itr/components/TdsRefund/TdsRefundReview/TdsReviewEstimateCards'
import { EMPTY_TAX } from '../../src/modules/itr/utils/tdsRefund.constants'

describe('TDS Refund review estimate', () => {
  it('is all zero when no income or TDS has been entered', () => {
    const est = computeTdsEstimate({ ...EMPTY_TAX })
    expect(est).toMatchObject({ grossIncome: 0, taxLiability: 0, totalCredits: 0, balance: 0 })
  })

  it('shows the full TDS as refund when income is under the new-regime rebate limit', () => {
    const est = computeTdsEstimate({ ...EMPTY_TAX, salaryIncome: '800000', totalTdsDeducted: '25000' })
    expect(est.taxLiability).toBe(0)
    expect(est.balance).toBe(25000)
  })

  it('reports additional tax payable when liability exceeds credits', () => {
    const est = computeTdsEstimate({ ...EMPTY_TAX, taxRegime: 'old', salaryIncome: '1500000', totalTdsDeducted: '1000' })
    expect(est.taxLiability).toBeGreaterThan(1000)
    expect(est.balance).toBeLessThan(0)
  })
})
