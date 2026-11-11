// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import {
  parseFinancialYear,
  getMonthlyPeriodOptions,
  getQuarterlyPeriodOptions,
  getAnnualPeriodOptions,
  getPeriodOptionsByFrequencyAndYear,
  remapPeriodToFinancialYear,
  getReturnTypeOptions,
  FINANCIAL_YEAR_OPTIONS,
} from '../../src/modules/gst/utils/gstPeriodOptions'
import { GSTFilingPeriod } from '../../src/modules/gst/components/GSTFiling/GSTFilingPeriod/GSTFilingPeriod'
import { DEFAULT_DOCUMENT_ITEMS } from '../../src/modules/gst/utils/gstDocumentsData'
import { GSTFilingDocuments } from '../../src/modules/gst/components/GSTFiling/GSTFilingDocuments/GSTFilingDocuments'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('GST Dynamic Filing Period Utils', () => {
  it('correctly parses financial years', () => {
    expect(parseFinancialYear('FY 2025-26')).toEqual({
      startYear: 2025,
      endYear: 2026,
      fyShort: 'FY 2025-26',
    })
    expect(parseFinancialYear('2024-25')).toEqual({
      startYear: 2024,
      endYear: 2025,
      fyShort: 'FY 2024-25',
    })
    // Future year adaptability
    expect(parseFinancialYear('FY 2028-29')).toEqual({
      startYear: 2028,
      endYear: 2029,
      fyShort: 'FY 2028-29',
    })
  })

  it('provides exactly 4 financial year options: FY 2022-23 to FY 2025-26', () => {
    expect(FINANCIAL_YEAR_OPTIONS.map((opt) => opt.value)).toEqual([
      'FY 2022-23',
      'FY 2023-24',
      'FY 2024-25',
      'FY 2025-26',
    ])
  })

  it('generates 12 monthly options starting from April (startYear) to March (endYear)', () => {
    const options2025 = getMonthlyPeriodOptions('FY 2025-26')
    expect(options2025).toHaveLength(12)
    expect(options2025[0].value).toBe('April 2025')
    expect(options2025[1].value).toBe('May 2025')
    expect(options2025[8].value).toBe('December 2025')
    expect(options2025[9].value).toBe('January 2026')
    expect(options2025[10].value).toBe('February 2026')
    expect(options2025[11].value).toBe('March 2026')

    // Works dynamically for any selected year
    const options2024 = getMonthlyPeriodOptions('FY 2024-25')
    expect(options2024[0].value).toBe('April 2024')
    expect(options2024[11].value).toBe('March 2025')
  })

  it('generates the 4 quarterly options based on financial year', () => {
    const quarters2025 = getQuarterlyPeriodOptions('FY 2025-26')
    expect(quarters2025).toHaveLength(4)
    expect(quarters2025.map((q) => q.value)).toEqual([
      'Q1 (Apr-Jun 2025)',
      'Q2 (Jul-Sep 2025)',
      'Q3 (Oct-Dec 2025)',
      'Q4 (Jan-Mar 2026)',
    ])

    const quarters2026 = getQuarterlyPeriodOptions('FY 2026-27')
    expect(quarters2026.map((q) => q.value)).toEqual([
      'Q1 (Apr-Jun 2026)',
      'Q2 (Jul-Sep 2026)',
      'Q3 (Oct-Dec 2026)',
      'Q4 (Jan-Mar 2027)',
    ])
  })

  it('generates only 1 annual return option based on financial year', () => {
    const annual2025 = getAnnualPeriodOptions('FY 2025-26')
    expect(annual2025).toHaveLength(1)
    expect(annual2025[0].value).toBe('FY 2025-26(Full Year Return)')

    const annual2024 = getAnnualPeriodOptions('FY 2024-25')
    expect(annual2024).toHaveLength(1)
    expect(annual2024[0].value).toBe('FY 2024-25(Full Year Return)')
  })

  it('remaps period seamlessly when user changes financial year', () => {
    // Monthly remapping
    expect(remapPeriodToFinancialYear('April 2025', 'FY 2024-25', 'Monthly')).toBe('April 2024')
    expect(remapPeriodToFinancialYear('March 2026', 'FY 2024-25', 'Monthly')).toBe('March 2025')

    // Quarterly remapping
    expect(remapPeriodToFinancialYear('Q2 (Jul-Sep 2025)', 'FY 2024-25', 'Quarterly')).toBe(
      'Q2 (Jul-Sep 2024)'
    )
    expect(remapPeriodToFinancialYear('Q4 (Jan-Mar 2026)', 'FY 2024-25', 'Quarterly')).toBe(
      'Q4 (Jan-Mar 2025)'
    )

    // Annual remapping
    expect(
      remapPeriodToFinancialYear('FY 2025-26(Full Year Return)', 'FY 2024-25', 'Annual')
    ).toBe('FY 2024-25(Full Year Return)')
  })
})

describe('GSTFilingPeriod Component Dynamic Behavior', () => {
  it('renders monthly options starting from April of selected financial year', () => {
    render(
      <GSTFilingPeriod
        initialData={{ financialYear: 'FY 2025-26', frequency: 'Monthly' }}
        onContinue={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    const periodSelect = screen.getByLabelText(/Filing Period \/ Return Period/i) as HTMLSelectElement
    const optionValues = Array.from(periodSelect.options).map((o) => o.value)

    expect(optionValues).toContain('April 2025')
    expect(optionValues).toContain('May 2025')
    expect(optionValues).toContain('March 2026')
  })

  it('renders 4 quarterly options when frequency is changed to Quarterly while keeping Filing Period / Return Period label', () => {
    render(
      <GSTFilingPeriod
        initialData={{ financialYear: 'FY 2025-26', frequency: 'Monthly' }}
        onContinue={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    // Select Quarterly frequency
    const quarterlyRadio = screen.getByRole('radio', { name: /Quarterly/i })
    fireEvent.click(quarterlyRadio)

    const periodSelect = screen.getByLabelText(/Filing Period \/ Return Period/i) as HTMLSelectElement
    const optionValues = Array.from(periodSelect.options).map((o) => o.value)

    expect(optionValues).toEqual([
      '',
      'Q1 (Apr-Jun 2025)',
      'Q2 (Jul-Sep 2025)',
      'Q3 (Oct-Dec 2025)',
      'Q4 (Jan-Mar 2026)',
    ])
  })

  it('renders only 1 annual return option when frequency is Annual while keeping Filing Period / Return Period label', () => {
    render(
      <GSTFilingPeriod
        initialData={{ financialYear: 'FY 2025-26', frequency: 'Monthly' }}
        onContinue={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    // Select Annual frequency
    const annualRadio = screen.getByRole('radio', { name: /Annual/i })
    fireEvent.click(annualRadio)

    const periodSelect = screen.getByLabelText(/Filing Period \/ Return Period/i) as HTMLSelectElement
    const optionValues = Array.from(periodSelect.options).map((o) => o.value)

    expect(optionValues).toEqual(['', 'FY 2025-26(Full Year Return)'])
  })

  it('updates options dynamically when financial year is changed', () => {
    render(
      <GSTFilingPeriod
        initialData={{ financialYear: 'FY 2025-26', frequency: 'Monthly', selectedMonth: 'April 2025' }}
        onContinue={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    // Change financial year to FY 2024-25
    const fySelect = screen.getByLabelText(/Financial Year/i)
    fireEvent.change(fySelect, { target: { value: 'FY 2024-25' } })

    const periodSelect = screen.getByLabelText(/Filing Period \/ Return Period/i) as HTMLSelectElement
    const optionValues = Array.from(periodSelect.options).map((o) => o.value)

    expect(optionValues).toContain('April 2024')
    expect(optionValues).toContain('March 2025')
    expect(optionValues).not.toContain('April 2025')
    // Automatically remapped selected month to April 2024
    expect(periodSelect.value).toBe('April 2024')
  })

  it('marks estimated figures fields with red star and enforces mandatory validation when selected', () => {
    const handleContinue = vi.fn()
    render(
      <GSTFilingPeriod
        initialData={{
          financialYear: 'FY 2025-26',
          frequency: 'Monthly',
          selectedMonth: 'April 2025',
          gstin: '29AAAAA0000A1Z5',
          filingType: 'regular',
          returnType: 'gstr1',
        }}
        onContinue={handleContinue}
        onCancel={vi.fn()}
      />
    )

    // Select "I already have estimated figures (Optional)"
    const estimatedOption = screen.getByText(/I already have estimated figures/i)
    fireEvent.click(estimatedOption)

    // Check that all 3 down fields have the mandatory red star
    const salesLabel = screen.getByText(/Estimated Taxable Sales/i)
    const purchasesLabel = screen.getByText(/Estimated Taxable Purchases/i)
    const itcLabel = screen.getByText(/Estimated Eligible ITC/i)

    expect(salesLabel.querySelector('.gst-calc-method__required')).not.toBeNull()
    expect(purchasesLabel.querySelector('.gst-calc-method__required')).not.toBeNull()
    expect(itcLabel.querySelector('.gst-calc-method__required')).not.toBeNull()

    // Try submitting with empty estimated figures
    const submitBtn = screen.getByRole('button', { name: /Continue/i })
    fireEvent.click(submitBtn)

    expect(handleContinue).not.toHaveBeenCalled()
    expect(screen.getByText('Please enter estimated taxable sales')).toBeDefined()
    expect(screen.getByText('Please enter estimated taxable purchases')).toBeDefined()
    expect(screen.getByText('Please enter estimated eligible ITC')).toBeDefined()

    // Fill in values
    const salesInput = screen.getByPlaceholderText('Enter sales amount')
    fireEvent.change(salesInput, { target: { value: '100000' } })
    const purchasesInput = screen.getByPlaceholderText('Enter purchases amount')
    fireEvent.change(purchasesInput, { target: { value: '80000' } })
    const itcInput = screen.getByPlaceholderText('Enter eligible ITC amount')
    fireEvent.change(itcInput, { target: { value: '14400' } })

    fireEvent.click(submitBtn)
    expect(handleContinue).toHaveBeenCalledTimes(1)
  })

  it('keeps constant label "Filing Period / Return Period" and sets placeholder based on frequency selection', () => {
    render(
      <GSTFilingPeriod
        initialData={{ financialYear: 'FY 2025-26', frequency: '' }}
        onContinue={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    const periodSelect = screen.getByLabelText(/Filing Period \/ Return Period/i) as HTMLSelectElement
    expect(periodSelect.options[0].text).toBe('Select filing frequency first')

    // Click Monthly
    fireEvent.click(screen.getByRole('radio', { name: /Monthly/i }))
    expect(screen.getByLabelText(/Filing Period \/ Return Period/i)).toBeDefined()
    expect(periodSelect.options[0].text).toBe('Select return period')

    // Click Quarterly
    fireEvent.click(screen.getByRole('radio', { name: /Quarterly/i }))
    expect(screen.getByLabelText(/Filing Period \/ Return Period/i)).toBeDefined()
    expect(periodSelect.options[0].text).toBe('Select return period')

    // Click Annual
    fireEvent.click(screen.getByRole('radio', { name: /Annual/i }))
    expect(screen.getByLabelText(/Filing Period \/ Return Period/i)).toBeDefined()
    expect(periodSelect.options[0].text).toBe('Select return period')
  })

  it('dynamically adapts Filing Return Type options based on selected filing frequency', () => {
    // 1. Verify utility function options
    const monthlyOptions = getReturnTypeOptions('Monthly')
    expect(monthlyOptions.map((o) => o.label)).toEqual([
      'GSTR-1 (Outward Supplies)',
      'GSTR-3B (Monthly Summary Return)',
    ])

    const quarterlyOptions = getReturnTypeOptions('Quarterly')
    expect(quarterlyOptions.map((o) => o.label)).toEqual([
      'GSTR-1 (QRMP — Quarterly)',
      'GSTR-3B (QRMP — Quarterly)',
    ])

    const annualOptions = getReturnTypeOptions('Annual')
    expect(annualOptions.map((o) => o.label)).toEqual([
      'GSTR-1 (Outward Supplies)',
      'GSTR-3B (Summary Return)',
    ])

    // 2. Verify in UI component
    render(
      <GSTFilingPeriod
        initialData={{ financialYear: 'FY 2025-26', frequency: 'Monthly' }}
        onContinue={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    const returnTypeSelect = screen.getByLabelText(/Filing Return Type/i) as HTMLSelectElement
    let labels = Array.from(returnTypeSelect.options).map((o) => o.text)
    expect(labels).toContain('GSTR-1 (Outward Supplies)')
    expect(labels).toContain('GSTR-3B (Monthly Summary Return)')

    // Switch to Quarterly
    fireEvent.click(screen.getByRole('radio', { name: /Quarterly/i }))
    labels = Array.from(returnTypeSelect.options).map((o) => o.text)
    expect(labels).toContain('GSTR-1 (QRMP — Quarterly)')
    expect(labels).toContain('GSTR-3B (QRMP — Quarterly)')

    // Switch to Annual
    fireEvent.click(screen.getByRole('radio', { name: /Annual/i }))
    labels = Array.from(returnTypeSelect.options).map((o) => o.text)
    expect(labels).toContain('GSTR-1 (Outward Supplies)')
    expect(labels).toContain('GSTR-3B (Summary Return)')
  })
})

describe('GST Filing Documents Mandatory Requirements', () => {
  it('marks all document definitions in DEFAULT_DOCUMENT_ITEMS as mandatory with isRequired true', () => {
    expect(DEFAULT_DOCUMENT_ITEMS.length).toBeGreaterThan(0)
    DEFAULT_DOCUMENT_ITEMS.forEach((doc) => {
      expect(doc.isRequired).toBe(true)
      expect(doc.badge).toBe('Required')
    })
  })

  it('renders all document items with red star required indicators', () => {
    render(
      <GSTFilingDocuments
        onBack={vi.fn()}
        onNext={vi.fn()}
      />
    )

    const redStars = document.querySelectorAll('.supporting-doc-item__required')
    expect(redStars.length).toBe(DEFAULT_DOCUMENT_ITEMS.length)
  })
})
