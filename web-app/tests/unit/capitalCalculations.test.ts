import { describe, it, expect } from 'vitest'
import {
  calculateAuthorisedShares,
  calculateShareholderAmount,
  calculateSubscribedCapital,
  calculateOwnershipPercentage,
  computeCapitalSummary,
} from '../../src/modules/incorporation/utils/capitalCalculations'

describe('Capital & Shareholding Dynamic Calculations', () => {
  describe('1. Reference Calculations (from specification)', () => {
    it('calculates Authorised Shares: ₹5,000 / ₹10 = 500 shares', () => {
      const res = calculateAuthorisedShares(5000, 10)
      expect(res.shares).toBe(500)
      expect(res.isDivisible).toBe(true)
      expect(res.displayShares).toBe('500 shares')
    })

    it('calculates Subscribed Capital: 300 allocated shares * ₹10 = ₹3,000', () => {
      expect(calculateSubscribedCapital(300, 10)).toBe(3000)
    })

    it('calculates Shareholder Amounts & Percentages: Shareholder A (200 shares) and B (100 shares)', () => {
      // Shareholder A: 200 shares * ₹10 = ₹2,000
      expect(calculateShareholderAmount(200, 10)).toBe(2000)
      const pA = calculateOwnershipPercentage(200, 300)
      expect(pA.formatted).toBe('66.67%')

      // Shareholder B: 100 shares * ₹10 = ₹1,000
      expect(calculateShareholderAmount(100, 10)).toBe(1000)
      const pB = calculateOwnershipPercentage(100, 300)
      expect(pB.formatted).toBe('33.33%')

      // Total summary integration
      const summary = computeCapitalSummary(
        5000,
        10,
        { 1: 200, 2: 100 },
        [1, 2]
      )
      expect(summary.authorisedShares).toBe(500)
      expect(summary.totalSubscribedShares).toBe(300)
      expect(summary.subscribedCapital).toBe(3000)
      expect(summary.displaySubscribedCapital).toBe('₹3,000')
      expect(summary.capitalCheckPassed).toBe(true)
      expect(summary.allocationCheckPassed).toBe(true)
      expect(summary.isAllPassed).toBe(true)

      expect(summary.shareholders[0].amount).toBe(2000)
      expect(summary.shareholders[0].displayAmount).toBe('₹2,000')
      expect(summary.shareholders[0].percentageFormatted).toBe('66.67%')

      expect(summary.shareholders[1].amount).toBe(1000)
      expect(summary.shareholders[1].displayAmount).toBe('₹1,000')
      expect(summary.shareholders[1].percentageFormatted).toBe('33.33%')
    })
  })

  describe('2. Real-time Recalculations on Source Changes', () => {
    it('recalculates authorised shares immediately when face value changes', () => {
      const res10 = calculateAuthorisedShares(500000, 10)
      expect(res10.shares).toBe(50000)
      expect(res10.displayShares).toBe('50,000 shares')

      const res100 = calculateAuthorisedShares(500000, 100)
      expect(res100.shares).toBe(5000)
      expect(res100.displayShares).toBe('5,000 shares')

      const res1 = calculateAuthorisedShares(500000, 1)
      expect(res1.shares).toBe(500000)
      expect(res1.displayShares).toBe('5,00,000 shares')
    })

    it('recalculates subscribed capital immediately when face value changes', () => {
      expect(calculateSubscribedCapital(1500, 10)).toBe(15000)
      expect(calculateSubscribedCapital(1500, 20)).toBe(30000)
      expect(calculateSubscribedCapital(1500, 50)).toBe(75000)
    })

    it('recalculates subscribed capital immediately when allocated shares change', () => {
      expect(calculateSubscribedCapital(500, 10)).toBe(5000)
      expect(calculateSubscribedCapital(1500, 10)).toBe(15000)
      expect(calculateSubscribedCapital(2500, 10)).toBe(25000)
    })
  })

  describe('3. Validation of Non-Integer / Fractional Shares (No Silent Rounding)', () => {
    it('detects fractional shares and marks isDivisible as false instead of silently rounding', () => {
      // ₹2,767,545 / ₹10 = 276,754.5 shares
      const res = calculateAuthorisedShares(2767545, 10)
      expect(res.isDivisible).toBe(false)
      expect(res.shares).toBe(276754.5)
      expect(res.displayShares).toBe('2,76,754.5 shares')
      expect(res.errorMessage).toBe('Authorised capital must be a multiple of face value per share')
    })

    it('resolves fractional error when authorised capital or face value is adjusted to a multiple', () => {
      // Change face value to 5: 2,767,545 / 5 = 553,509 shares (clean integer)
      const res5 = calculateAuthorisedShares(2767545, 5)
      expect(res5.isDivisible).toBe(true)
      expect(res5.shares).toBe(553509)
      expect(res5.displayShares).toBe('5,53,509 shares')
      expect(res5.errorMessage).toBeUndefined()
    })
  })

  describe('4. Division by Zero, Empty, and Edge Cases', () => {
    it('shows appropriate empty state (-- shares) when inputs are empty or missing', () => {
      const resEmpty = calculateAuthorisedShares('', '')
      expect(resEmpty.shares).toBeNull()
      expect(resEmpty.displayShares).toBe('-- shares')

      const resMissingFace = calculateAuthorisedShares(2767545, '')
      expect(resMissingFace.shares).toBeNull()
      expect(resMissingFace.displayShares).toBe('-- shares')
    })

    it('strictly guards against division by zero if face value is 0', () => {
      const resZero = calculateAuthorisedShares(100000, 0)
      expect(resZero.shares).toBeNull()
      expect(resZero.displayShares).toBe('-- shares')
      expect(resZero.errorMessage).toBe('Face value must be greater than 0')
    })

    it('handles negative and non-numeric inputs safely', () => {
      const resNeg = calculateAuthorisedShares(-50000, 10)
      expect(resNeg.shares).toBeNull()
      expect(resNeg.displayShares).toBe('-- shares')

      const resInvalid = calculateAuthorisedShares('abc', 'xyz')
      expect(resInvalid.shares).toBeNull()
      expect(resInvalid.displayShares).toBe('-- shares')
    })

    it('displays initial state for Subscribed Capital when 0 shares are allocated', () => {
      const summary = computeCapitalSummary(100000, 10, {}, [])
      expect(summary.totalSubscribedShares).toBe(0)
      expect(summary.subscribedCapital).toBe(0)
      expect(summary.displaySubscribedCapital).toBe('₹0')
    })
  })

  describe('5. Shareholder Add, Edit, and Remove Dynamics', () => {
    it('dynamically recalculates when a shareholder is added or removed', () => {
      // 2 shareholders
      const s2 = computeCapitalSummary(
        100000,
        10,
        { 1: 5000, 2: 5000 },
        [1, 2]
      )
      expect(s2.totalSubscribedShares).toBe(10000)
      expect(s2.subscribedCapital).toBe(100000)
      expect(s2.shareholders[0].percentageFormatted).toBe('50%')
      expect(s2.shareholders[1].percentageFormatted).toBe('50%')

      // Add 3rd shareholder with 2000 shares
      const s3 = computeCapitalSummary(
        100000,
        10,
        { 1: 5000, 2: 3000, 3: 2000 },
        [1, 2, 3]
      )
      expect(s3.totalSubscribedShares).toBe(10000)
      expect(s3.subscribedCapital).toBe(100000)
      expect(s3.shareholders[0].percentageFormatted).toBe('50%')
      expect(s3.shareholders[1].percentageFormatted).toBe('30%')
      expect(s3.shareholders[2].percentageFormatted).toBe('20%')

      // Remove 3rd shareholder (only ids 1 and 2 active)
      const sRemoved = computeCapitalSummary(
        100000,
        10,
        { 1: 5000, 2: 3000, 3: 2000 },
        [1, 2]
      )
      expect(sRemoved.totalSubscribedShares).toBe(8000)
      expect(sRemoved.subscribedCapital).toBe(80000)
      expect(sRemoved.shareholders[0].percentageFormatted).toBe('62.5%')
      expect(sRemoved.shareholders[1].percentageFormatted).toBe('37.5%')
    })
  })
})
