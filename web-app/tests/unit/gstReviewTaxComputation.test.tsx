// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GSTReviewTaxComputationCard } from '../../src/modules/gst/components/GSTFiling/GSTFilingReview/GSTReviewComputation'
import { getReconciledTaxComputation } from '../../src/modules/gst/utils/gstReviewData'

describe('GSTReviewTaxComputation', () => {
  it('renders Estimated Taxable Purchases directly below Gross Taxable Turnover', () => {
    render(
      <GSTReviewTaxComputationCard
        turnover={1000000}
        purchases={500000}
        outputGst={180000}
        eligibleItc={90000}
        netLiability={90000}
      />
    )

    const turnoverLabel = screen.getByText('Gross Taxable Turnover')
    const purchasesLabel = screen.getByText('Estimated Taxable Purchases')

    expect(turnoverLabel).toBeTruthy()
    expect(purchasesLabel).toBeTruthy()

    // Verify ordering in DOM: purchases row comes after turnover row
    const card = screen.getAllByRole('heading', { level: 3 })[0].closest('.gst-comp-card')
    const rows = card?.querySelectorAll('.gst-comp-row')
    expect(rows).toBeDefined()
    if (rows) {
      expect(rows[0].textContent).toContain('Gross Taxable Turnover')
      expect(rows[1].textContent).toContain('Estimated Taxable Purchases')
      expect(rows[2].textContent).toContain('Output GST (18%)')
      expect(rows[3].textContent).toContain('Eligible Input Tax Credit (ITC)')
      expect(rows[4].textContent).toContain('Net Tax Liability (Govt)')
    }
  })

  it('calculates purchases correctly in getReconciledTaxComputation', () => {
    // Custom estimated purchases provided
    const figures = getReconciledTaxComputation({
      filingType: 'regular',
      calculationMethod: 'estimated_figures',
      estimatedSales: '1200000',
      estimatedPurchases: '600000',
      estimatedItc: '108000',
    })
    expect(figures.turnover).toBe(1200000)
    expect(figures.purchases).toBe(600000)

    // Nil return has 0 turnover and 0 purchases
    const nilFigures = getReconciledTaxComputation({
      filingType: 'nil',
    })
    expect(nilFigures.turnover).toBe(0)
    expect(nilFigures.purchases).toBe(0)

    // Default regular returns fallback purchases
    const defaultFigures = getReconciledTaxComputation({})
    expect(defaultFigures.turnover).toBe(866598)
    expect(defaultFigures.purchases).toBe(452300)
  })
})
