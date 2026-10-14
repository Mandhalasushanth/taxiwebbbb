// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cleanup, render, screen, act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@core/config/environment', () => ({
  env: {
    appName: 'TaxEdge',
    apiBaseUrl: 'http://localhost:3000',
    enableMocks: true,
    isDev: true,
    isProd: false,
  },
}))

import { authStorage } from '../../src/core/auth'
import { localStore } from '../../src/core/storage/localStorage'
import {
  getDefaultSourcesForCategory,
  getItrChecklistSections,
  DEFAULT_SALARY_DETAILS,
  DEFAULT_HOUSE_PROPERTY_DETAILS,
  DEFAULT_BUSINESS_DETAILS,
  DEFAULT_CAPITAL_GAINS_DETAILS,
  DEFAULT_OTHER_SOURCES_DETAILS,
  DEFAULT_DEDUCTIONS,
} from '../../src/modules/itr/components/ItrFiling/itrFiling.constants'
import { useItrFilingState } from '../../src/modules/itr/components/ItrFiling/useItrFilingState'
import { ItrIncomeSourcesView } from '../../src/modules/itr/components/ItrFiling/IncomeSources/ItrIncomeSourcesView'
import { determineApplicableItrForm } from '../../src/modules/itr/components/ItrFiling/IncomeSources/ItrApplicableReturnFormCard'
import { ItrReviewSubmissionView } from '../../src/modules/itr/components/ItrFiling/ReviewSubmission/ItrReviewSubmissionView'

afterEach(() => {
  cleanup()
})

describe('ITR Category to Income Source Preselection', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    localStore.clear()
    window.scrollTo = () => {}
    authStorage.setUser({
      id: 'usr_test_itr',
      fullName: 'Test Taxpayer',
      email: 'taxpayer@example.com',
      mobile: '9876543210',
      role: 'CUSTOMER',
      isProfileComplete: true,
    })
  })

  describe('getDefaultSourcesForCategory pure mappings', () => {
    it('preselects Salary / Pension for salaried', () => {
      expect(getDefaultSourcesForCategory('salaried')).toEqual(['salary'])
    })

    it('preselects Business / Profession for business', () => {
      expect(getDefaultSourcesForCategory('business')).toEqual(['business'])
    })

    it('preselects Business / Profession for professional', () => {
      expect(getDefaultSourcesForCategory('professional')).toEqual(['business'])
    })

    it('preselects Business / Profession for freelancer', () => {
      expect(getDefaultSourcesForCategory('freelancer')).toEqual(['business'])
    })

    it('preselects Capital Gains for trader', () => {
      expect(getDefaultSourcesForCategory('trader')).toEqual(['capital_gains'])
    })

    it('preselects Capital Gains for capital_gains', () => {
      expect(getDefaultSourcesForCategory('capital_gains')).toEqual(['capital_gains'])
    })

    it('preselects House Property for rental', () => {
      expect(getDefaultSourcesForCategory('rental')).toEqual(['house_property'])
    })

    it('preselects both Salary / Pension and Business / Profession for multiple', () => {
      expect(getDefaultSourcesForCategory('multiple')).toEqual(['salary', 'business'])
    })
  })

  describe('useItrFilingState integration', () => {
    it('updates selectedSources when category is selected', () => {
      const { result } = renderHook(() => useItrFilingState(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      })

      act(() => {
        result.current.setSelectedCategoryId('salaried')
      })
      expect(result.current.selectedCategoryId).toBe('salaried')
      expect(result.current.selectedSources).toEqual(['salary'])

      act(() => {
        result.current.setSelectedCategoryId('business')
      })
      expect(result.current.selectedCategoryId).toBe('business')
      expect(result.current.selectedSources).toEqual(['business'])

      act(() => {
        result.current.setSelectedCategoryId('freelancer')
      })
      expect(result.current.selectedCategoryId).toBe('freelancer')
      expect(result.current.selectedSources).toEqual(['business'])

      act(() => {
        result.current.setSelectedCategoryId('trader')
      })
      expect(result.current.selectedCategoryId).toBe('trader')
      expect(result.current.selectedSources).toEqual(['capital_gains'])

      act(() => {
        result.current.setSelectedCategoryId('capital_gains')
      })
      expect(result.current.selectedCategoryId).toBe('capital_gains')
      expect(result.current.selectedSources).toEqual(['capital_gains'])

      act(() => {
        result.current.setSelectedCategoryId('rental')
      })
      expect(result.current.selectedCategoryId).toBe('rental')
      expect(result.current.selectedSources).toEqual(['house_property'])

      act(() => {
        result.current.setSelectedCategoryId('multiple')
      })
      expect(result.current.selectedCategoryId).toBe('multiple')
      expect(result.current.selectedSources).toEqual(['salary', 'business'])
    })
  })

  describe('ItrIncomeSourcesView UI pill preselection based on selectedCategoryId', () => {
    const defaultProps = {
      onBack: vi.fn(),
      onNext: vi.fn(),
      salaryDetails: DEFAULT_SALARY_DETAILS,
      onSalaryDetailsChange: vi.fn(),
      housePropertyDetails: DEFAULT_HOUSE_PROPERTY_DETAILS,
      onHousePropertyDetailsChange: vi.fn(),
      businessDetails: DEFAULT_BUSINESS_DETAILS,
      onBusinessDetailsChange: vi.fn(),
      capitalGainsDetails: DEFAULT_CAPITAL_GAINS_DETAILS,
      onCapitalGainsDetailsChange: vi.fn(),
      otherSourcesDetails: DEFAULT_OTHER_SOURCES_DETAILS,
      onOtherSourcesDetailsChange: vi.fn(),
    }

    it('preselects Salary / Pension pill for salaried category', () => {
      render(
        <ItrIncomeSourcesView
          {...defaultProps}
          selectedCategoryId="salaried"
          selectedSources={getDefaultSourcesForCategory('salaried')}
        />
      )
      const salaryPill = screen.getByRole('button', { name: /salary \/ pension/i })
      expect(salaryPill.className).toContain('itr-source-pill--active')
      expect(screen.getByRole('heading', { name: 'Salary Income' })).toBeDefined()
    })

    it('preselects Business / Profession pill for business category', () => {
      render(
        <ItrIncomeSourcesView
          {...defaultProps}
          selectedCategoryId="business"
          selectedSources={getDefaultSourcesForCategory('business')}
        />
      )
      const businessPill = screen.getByRole('button', { name: /business \/ profession/i })
      expect(businessPill.className).toContain('itr-source-pill--active')
      expect(screen.getByRole('heading', { name: 'Business / Profession' })).toBeDefined()
    })

    it('preselects Capital Gains pill for trader category', () => {
      render(
        <ItrIncomeSourcesView
          {...defaultProps}
          selectedCategoryId="trader"
          selectedSources={getDefaultSourcesForCategory('trader')}
        />
      )
      const capitalPill = screen.getByRole('button', { name: /capital gains/i })
      expect(capitalPill.className).toContain('itr-source-pill--active')
      expect(screen.getByRole('heading', { name: /Capital Gains & Trading/i })).toBeDefined()
    })

    it('preselects House Property pill for rental category', () => {
      render(
        <ItrIncomeSourcesView
          {...defaultProps}
          selectedCategoryId="rental"
          selectedSources={getDefaultSourcesForCategory('rental')}
        />
      )
      const housePill = screen.getByRole('button', { name: /house property/i })
      expect(housePill.className).toContain('itr-source-pill--active')
      expect(screen.getByRole('heading', { name: 'House Property' })).toBeDefined()
    })

    it('preselects both Salary and Business pills for multiple sources category', () => {
      render(
        <ItrIncomeSourcesView
          {...defaultProps}
          selectedCategoryId="multiple"
          selectedSources={getDefaultSourcesForCategory('multiple')}
        />
      )
      const salaryPill = screen.getByRole('button', { name: /salary \/ pension/i })
      const businessPill = screen.getByRole('button', { name: /business \/ profession/i })
      expect(salaryPill.className).toContain('itr-source-pill--active')
      expect(businessPill.className).toContain('itr-source-pill--active')
      expect(screen.getByRole('heading', { name: 'Salary Income' })).toBeDefined()
      expect(screen.getByRole('heading', { name: 'Business / Profession' })).toBeDefined()
    })
  })

  describe('Dynamic Applicable Return Form (ItrApplicableReturnFormCard)', () => {
    it('determines ITR-1 for salaried/interest income up to 50 Lakhs (Image 4)', () => {
      render(
        <ItrIncomeSourcesView
          onBack={vi.fn()}
          onNext={vi.fn()}
          salaryDetails={DEFAULT_SALARY_DETAILS}
          onSalaryDetailsChange={vi.fn()}
          housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
          onHousePropertyDetailsChange={vi.fn()}
          businessDetails={DEFAULT_BUSINESS_DETAILS}
          onBusinessDetailsChange={vi.fn()}
          capitalGainsDetails={DEFAULT_CAPITAL_GAINS_DETAILS}
          onCapitalGainsDetailsChange={vi.fn()}
          otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
          onOtherSourcesDetailsChange={vi.fn()}
          selectedCategoryId="salaried"
          selectedSources={['other_sources']}
        />
      )

      expect(screen.getByText('ITR-1')).toBeDefined()
      expect(screen.getByText(/Based on your salary and interest income up to ₹50 Lakhs/i)).toBeDefined()
      expect(screen.getByText('Resident individual with income <= ₹50 Lakhs')).toBeDefined()
    })

    it('determines ITR-2 when income exceeds 50 Lakhs or for capital gains without business (Image 1)', () => {
      render(
        <ItrIncomeSourcesView
          onBack={vi.fn()}
          onNext={vi.fn()}
          salaryDetails={DEFAULT_SALARY_DETAILS}
          onSalaryDetailsChange={vi.fn()}
          housePropertyDetails={{
            ...DEFAULT_HOUSE_PROPERTY_DETAILS,
            propertyType: 'let_out',
            annualRentReceived: '9585858',
          }}
          onHousePropertyDetailsChange={vi.fn()}
          businessDetails={DEFAULT_BUSINESS_DETAILS}
          onBusinessDetailsChange={vi.fn()}
          capitalGainsDetails={DEFAULT_CAPITAL_GAINS_DETAILS}
          onCapitalGainsDetailsChange={vi.fn()}
          otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
          onOtherSourcesDetailsChange={vi.fn()}
          selectedCategoryId="rental"
          selectedSources={['house_property']}
        />
      )

      expect(screen.getByText('ITR-2')).toBeDefined()
      expect(screen.getByText('Based on total income exceeding ₹50 Lakhs, ITR-2 applies.')).toBeDefined()
      expect(screen.getByText('Total gross income exceeds ₹50 Lakhs')).toBeDefined()
      expect(screen.getByText('No business or professional income declared')).toBeDefined()
    })

    it('determines ITR-4 for presumptive taxation 44AD / 44ADA (Image 2)', () => {
      render(
        <ItrIncomeSourcesView
          onBack={vi.fn()}
          onNext={vi.fn()}
          salaryDetails={DEFAULT_SALARY_DETAILS}
          onSalaryDetailsChange={vi.fn()}
          housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
          onHousePropertyDetailsChange={vi.fn()}
          businessDetails={{
            reportingMethod: '44ADA',
            grossTurnover: '2500000',
            declaredNetProfit: '1250000',
          }}
          onBusinessDetailsChange={vi.fn()}
          capitalGainsDetails={DEFAULT_CAPITAL_GAINS_DETAILS}
          onCapitalGainsDetailsChange={vi.fn()}
          otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
          onOtherSourcesDetailsChange={vi.fn()}
          selectedCategoryId="business"
          selectedSources={['business']}
        />
      )

      expect(screen.getByText('ITR-4')).toBeDefined()
      expect(screen.getByText(/Based on presumptive business or professional income under Section 44AD \/ 44ADA/i)).toBeDefined()
      expect(screen.getByText('Presumptive taxation selected (Section 44ADA)')).toBeDefined()
      expect(screen.getByText('Resident individual status confirmed')).toBeDefined()
    })

    it('determines ITR-3 for F&O / Intraday trading activity (Image 3 & 5)', () => {
      render(
        <ItrIncomeSourcesView
          onBack={vi.fn()}
          onNext={vi.fn()}
          salaryDetails={DEFAULT_SALARY_DETAILS}
          onSalaryDetailsChange={vi.fn()}
          housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
          onHousePropertyDetailsChange={vi.fn()}
          businessDetails={DEFAULT_BUSINESS_DETAILS}
          onBusinessDetailsChange={vi.fn()}
          capitalGainsDetails={{
            assetTypes: ['F&O & Intraday Trading'],
            stcg: '30000',
            ltcg: '50000',
          }}
          onCapitalGainsDetailsChange={vi.fn()}
          otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
          onOtherSourcesDetailsChange={vi.fn()}
          selectedCategoryId="trader"
          selectedSources={['capital_gains']}
        />
      )

      expect(screen.getByText('ITR-3')).toBeDefined()
      expect(screen.getByText('Based on your F&O or Intraday trading activity, ITR-3 applies.')).toBeDefined()
      expect(screen.getByText('F&O / Intraday trading activity detected (taxed as business income)')).toBeDefined()
      expect(screen.getByText('Mandatory filing under ITR-3 as per Income Tax Department rules')).toBeDefined()
    })

    describe('User-specified ITR form matrix rules', () => {
      it('Salary and Pension alone -> ITR-1', () => {
        const info = determineApplicableItrForm({ selectedSources: ['salary'] })
        expect(info.form).toBe('ITR-1')
      })

      it('House Property alone -> ITR-1', () => {
        const info = determineApplicableItrForm({ selectedSources: ['house_property'] })
        expect(info.form).toBe('ITR-1')
      })

      it('Business and Profession alone -> ITR-4', () => {
        const info = determineApplicableItrForm({ selectedSources: ['business'] })
        expect(info.form).toBe('ITR-4')
      })

      it('Capital Gains alone (standard without F&O) -> ITR-2', () => {
        const info = determineApplicableItrForm({ selectedSources: ['capital_gains'] })
        expect(info.form).toBe('ITR-2')
      })

      it('Other Sources alone -> ITR-1', () => {
        const info = determineApplicableItrForm({ selectedSources: ['other_sources'] })
        expect(info.form).toBe('ITR-1')
      })

      it('Salary/Pension + House Property -> ITR-1', () => {
        const info = determineApplicableItrForm({ selectedSources: ['salary', 'house_property'] })
        expect(info.form).toBe('ITR-1')
      })

      it('Salary + House + Business -> ITR-4', () => {
        const info = determineApplicableItrForm({ selectedSources: ['salary', 'house_property', 'business'] })
        expect(info.form).toBe('ITR-4')
      })

      it('Salary + House + Business + Capital -> ITR-3', () => {
        const info = determineApplicableItrForm({
          selectedSources: ['salary', 'house_property', 'business', 'capital_gains'],
        })
        expect(info.form).toBe('ITR-3')
      })

      it('All income sources (Salary, House, Business, Capital, Other) -> ITR-3', () => {
        const info = determineApplicableItrForm({
          selectedSources: ['salary', 'house_property', 'business', 'capital_gains', 'other_sources'],
        })
        expect(info.form).toBe('ITR-3')
      })

      it('Capital Gains with Crypto / VDA -> ITR-2 with VDA criteria (Image 2)', () => {
        const info = determineApplicableItrForm({
          selectedSources: ['capital_gains'],
          capitalGainsDetails: {
            assetTypes: ['Crypto / VDA'],
            stcg: '',
            ltcg: '',
          },
        })
        expect(info.form).toBe('ITR-2')
        expect(info.reason).toBe('Based on your capital gains without business income, ITR-2 applies.')
        expect(info.criteria).toContain('Virtual Digital Assets (Crypto / VDA) declared')
      })

      it('Capital Gains with F&O & Intraday Trading -> ITR-3 (Image 1 & 3)', () => {
        const info = determineApplicableItrForm({
          selectedSources: ['capital_gains'],
          capitalGainsDetails: {
            assetTypes: ['F&O & Intraday Trading'],
            stcg: '',
            ltcg: '',
          },
        })
        expect(info.form).toBe('ITR-3')
        expect(info.reason).toBe('Based on your F&O or Intraday trading activity, ITR-3 applies.')
        expect(info.criteria).toContain('F&O / Intraday trading activity detected (taxed as business income)')
      })
    })

    describe('Capital Gains Interactive Asset Type Notices (Image 1, 2, 3)', () => {
      it('shows F&O Section 43(5) notice when F&O is active and Crypto 115BBH notice when Crypto is active', () => {
        const onCapitalGainsDetailsChange = vi.fn()
        const { rerender } = render(
          <ItrIncomeSourcesView
            onBack={vi.fn()}
            onNext={vi.fn()}
            salaryDetails={DEFAULT_SALARY_DETAILS}
            onSalaryDetailsChange={vi.fn()}
            housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
            onHousePropertyDetailsChange={vi.fn()}
            businessDetails={DEFAULT_BUSINESS_DETAILS}
            onBusinessDetailsChange={vi.fn()}
            capitalGainsDetails={{
              assetTypes: ['F&O & Intraday Trading'],
              stcg: '',
              ltcg: '',
            }}
            onCapitalGainsDetailsChange={onCapitalGainsDetailsChange}
            otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
            onOtherSourcesDetailsChange={vi.fn()}
            selectedCategoryId="capital_gains"
            selectedSources={['capital_gains']}
          />
        )

        expect(
          screen.getByText(/F&O and Intraday trades are treated as business income under Section 43\(5\)\. ITR-3 will apply\./i)
        ).toBeDefined()
        expect(screen.queryByText(/Virtual Digital Assets \(VDA\) are taxed at 30% u\/s 115BBH\./i)).toBeNull()

        // Rerender with Crypto / VDA
        rerender(
          <ItrIncomeSourcesView
            onBack={vi.fn()}
            onNext={vi.fn()}
            salaryDetails={DEFAULT_SALARY_DETAILS}
            onSalaryDetailsChange={vi.fn()}
            housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
            onHousePropertyDetailsChange={vi.fn()}
            businessDetails={DEFAULT_BUSINESS_DETAILS}
            onBusinessDetailsChange={vi.fn()}
            capitalGainsDetails={{
              assetTypes: ['Crypto / VDA'],
              stcg: '',
              ltcg: '',
            }}
            onCapitalGainsDetailsChange={onCapitalGainsDetailsChange}
            otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
            onOtherSourcesDetailsChange={vi.fn()}
            selectedCategoryId="capital_gains"
            selectedSources={['capital_gains']}
          />
        )

        expect(
          screen.getByText(/Virtual Digital Assets \(VDA\) are taxed at 30% u\/s 115BBH\./i)
        ).toBeDefined()
        expect(
          screen.queryByText(/F&O and Intraday trades are treated as business income under Section 43\(5\)/i)
        ).toBeNull()

        // Rerender with Both F&O and Crypto active (Image 3)
        rerender(
          <ItrIncomeSourcesView
            onBack={vi.fn()}
            onNext={vi.fn()}
            salaryDetails={DEFAULT_SALARY_DETAILS}
            onSalaryDetailsChange={vi.fn()}
            housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
            onHousePropertyDetailsChange={vi.fn()}
            businessDetails={DEFAULT_BUSINESS_DETAILS}
            onBusinessDetailsChange={vi.fn()}
            capitalGainsDetails={{
              assetTypes: ['F&O & Intraday Trading', 'Crypto / VDA'],
              stcg: '',
              ltcg: '',
            }}
            onCapitalGainsDetailsChange={onCapitalGainsDetailsChange}
            otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
            onOtherSourcesDetailsChange={vi.fn()}
            selectedCategoryId="capital_gains"
            selectedSources={['capital_gains']}
          />
        )

        expect(
          screen.getByText(/F&O and Intraday trades are treated as business income under Section 43\(5\)\. ITR-3 will apply\./i)
        ).toBeDefined()
        expect(
          screen.getByText(/Virtual Digital Assets \(VDA\) are taxed at 30% u\/s 115BBH\./i)
        ).toBeDefined()
      })

      it('enforces mandatory Short-Term Gains and Long-Term Gains fields', () => {
        render(
          <ItrIncomeSourcesView
            onBack={vi.fn()}
            onNext={vi.fn()}
            salaryDetails={DEFAULT_SALARY_DETAILS}
            onSalaryDetailsChange={vi.fn()}
            housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
            onHousePropertyDetailsChange={vi.fn()}
            businessDetails={DEFAULT_BUSINESS_DETAILS}
            onBusinessDetailsChange={vi.fn()}
            capitalGainsDetails={{
              assetTypes: ['Equity & Mutual Funds'],
              stcg: '',
              ltcg: '',
            }}
            onCapitalGainsDetailsChange={vi.fn()}
            otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
            onOtherSourcesDetailsChange={vi.fn()}
            selectedCategoryId="capital_gains"
            selectedSources={['capital_gains']}
          />
        )

        // Labels have mandatory asterisk
        const stcgLabel = screen.getByText(/Short-Term Gains \(STCG\)/i)
        const ltcgLabel = screen.getByText(/Long-Term Gains \(LTCG\)/i)
        expect(stcgLabel.textContent).toContain('*')
        expect(ltcgLabel.textContent).toContain('*')

        // Trigger attempt
        act(() => {
          window.dispatchEvent(new CustomEvent('step-action-bar:submit-attempt'))
        })

        // Error messages are shown
        expect(screen.getByText('Short-Term Gains is required')).toBeDefined()
        expect(screen.getByText('Long-Term Gains is required')).toBeDefined()
      })

      it('enforces selecting at least one asset type when STCG and LTCG are filled', () => {
        const onNext = vi.fn()
        render(
          <ItrIncomeSourcesView
            onBack={vi.fn()}
            onNext={onNext}
            salaryDetails={DEFAULT_SALARY_DETAILS}
            onSalaryDetailsChange={vi.fn()}
            housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
            onHousePropertyDetailsChange={vi.fn()}
            businessDetails={DEFAULT_BUSINESS_DETAILS}
            onBusinessDetailsChange={vi.fn()}
            capitalGainsDetails={{
              assetTypes: [], // no asset type selected
              stcg: '345678',
              ltcg: '2345',
            }}
            onCapitalGainsDetailsChange={vi.fn()}
            otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
            onOtherSourcesDetailsChange={vi.fn()}
            selectedCategoryId="capital_gains"
            selectedSources={['capital_gains']}
          />
        )

        // Label has mandatory asterisk
        const assetLabel = screen.getByText(/Asset Types Traded/i)
        expect(assetLabel.textContent).toContain('*')

        // Trigger attempt
        act(() => {
          window.dispatchEvent(new CustomEvent('step-action-bar:submit-attempt'))
        })

        // Warning message is shown and does not proceed
        expect(screen.getByText('Please select at least one asset type')).toBeDefined()
        expect(onNext).not.toHaveBeenCalled()
      })
    })

    describe('Step 3: Document Checklist matching reference images', () => {
      it('Image 1 (Salaried): requires Form 16, recommends 4 documents (total 5)', () => {
        const sections = getItrChecklistSections({ selectedSources: ['salary'] })
        expect(sections.requiredDocs.map((d) => d.title)).toEqual(['Form 16 (Part A & B)'])
        expect(sections.requiredDocs[0].isMandatory).toBe(true)
        expect(sections.recommendedDocs.map((d) => d.title)).toEqual([
          'Form 26AS Tax Credit Statement',
          'AIS / TIS Statement',
          'Bank Account Statement',
          'Salary Payslips',
        ])
        expect(sections.optionalDocs).toHaveLength(0)
        expect(sections.totalCount).toBe(5)
      })

      it('Image 2 (Business / Profession): requires Business Turnover & GST Filings, recommends 3 docs (total 4)', () => {
        const sections = getItrChecklistSections({ selectedSources: ['business'] })
        expect(sections.requiredDocs.map((d) => d.title)).toEqual(['Business Turnover & GST Filings'])
        expect(sections.requiredDocs[0].isMandatory).toBe(true)
        expect(sections.recommendedDocs.map((d) => d.title)).toEqual([
          'Form 26AS Tax Credit Statement',
          'AIS / TIS Statement',
          'Bank Account Statement',
        ])
        expect(sections.optionalDocs).toHaveLength(0)
        expect(sections.totalCount).toBe(4)
      })

      it('Image 3 (Capital Gains): requires Capital Gains Statement / P&L, recommends 3 docs (total 4)', () => {
        const sections = getItrChecklistSections({ selectedSources: ['capital_gains'] })
        expect(sections.requiredDocs.map((d) => d.title)).toEqual(['Capital Gains Statement / P&L'])
        expect(sections.requiredDocs[0].isMandatory).toBe(true)
        expect(sections.recommendedDocs.map((d) => d.title)).toEqual([
          'Form 26AS Tax Credit Statement',
          'AIS / TIS Statement',
          'Bank Account Statement',
        ])
        expect(sections.optionalDocs).toHaveLength(0)
        expect(sections.totalCount).toBe(4)
      })

      it('Image 4 (House Property): 3 recommended + 1 only if applicable optional (total 4)', () => {
        const sections = getItrChecklistSections({ selectedSources: ['house_property'] })
        expect(sections.requiredDocs).toHaveLength(0)
        expect(sections.recommendedDocs.map((d) => d.title)).toEqual([
          'Form 26AS Tax Credit Statement',
          'AIS / TIS Statement',
          'Bank Account Statement',
        ])
        expect(sections.optionalDocs.map((d) => d.title)).toEqual([
          'Home Loan Interest Certificate (Sec 24b)',
        ])
        expect(sections.optionalDocs[0].isMandatory).toBeFalsy()
        expect(sections.totalCount).toBe(4)
      })

      it('Image 5 (Other Sources / Multiple): requires Form 16 & Business Turnover, recommends 4 docs (total 6)', () => {
        const sections = getItrChecklistSections({ selectedSources: ['other_sources'] })
        expect(sections.requiredDocs.map((d) => d.title)).toEqual([
          'Form 16 (Part A & B)',
          'Business Turnover & GST Filings',
        ])
        expect(sections.recommendedDocs.map((d) => d.title)).toEqual([
          'Form 26AS Tax Credit Statement',
          'AIS / TIS Statement',
          'Bank Account Statement',
          'Salary Payslips',
        ])
        expect(sections.totalCount).toBe(6)
      })
    })

    describe('Step 4: Tax Summary & Review View (Dynamic data)', () => {
      it('renders dynamic profile, bank, applicable form, and tax calculation from props', () => {
        authStorage.setUser({
          id: 'usr_sagarika',
          fullName: 'Sagarika',
          pan: 'GFDHJ5869R',
          mobile: '9876543210',
          email: 'sagarika@example.com',
          role: 'CUSTOMER',
        })

        const onEditStep = vi.fn()
        const onSubmit = vi.fn()

        render(
          <ItrReviewSubmissionView
            onBack={vi.fn()}
            onEditStep={onEditStep}
            onSubmit={onSubmit}
            onSaveDraft={vi.fn()}
            assessmentYear="AY 2026-2027"
            residentialStatus="resident"
            filingType="original"
            selectedBank={{
              id: 'bank-1',
              bankName: 'Bsbsbs',
              accountNumber: '123456787673',
              accountType: 'Savings',
              ifscCode: 'BSBS0001234',
              isPrimary: true,
              isRefundSelected: true,
            }}
            salaryDetails={DEFAULT_SALARY_DETAILS}
            housePropertyDetails={DEFAULT_HOUSE_PROPERTY_DETAILS}
            businessDetails={DEFAULT_BUSINESS_DETAILS}
            capitalGainsDetails={DEFAULT_CAPITAL_GAINS_DETAILS}
            otherSourcesDetails={DEFAULT_OTHER_SOURCES_DETAILS}
            selectedSources={['salary']}
            selectedRegime="new"
            deductions={DEFAULT_DEDUCTIONS}
            uploadedDocs={{}}
          />
        )

        // Banner
        expect(screen.getByText('Review Your ITR Application')).toBeDefined()

        // Summary & Declared Income
        expect(screen.getByText(/PAN: GFDHJ5869R/)).toBeDefined()
        expect(screen.getByText(/Name: Sagarika/)).toBeDefined()
        expect(screen.getByText('Profile Verified')).toBeDefined()
        expect(screen.getAllByText(/Bsbsbs \(···· 7673\)/)).toHaveLength(2)
        expect(screen.getByText('Selected')).toBeDefined()

        // Estimated Tax Summary
        expect(screen.getByText('Estimated Tax Summary')).toBeDefined()
        expect(screen.getByText('New Tax Regime')).toBeDefined()
        expect(screen.getByText('1. Gross Total Income')).toBeDefined()
        expect(screen.getByText('Net Tax Payable')).toBeDefined()

        // Filing & Taxpayer Details
        expect(screen.getByText('AY 2026-2027')).toBeDefined()
        expect(screen.getByText('ITR-1')).toBeDefined()
        expect(screen.getByText('Resident')).toBeDefined()

        // Declaration & Submit
        const submitBtn = screen.getByRole('button', { name: /Submit for CA Review/i })
        expect((submitBtn as HTMLButtonElement).disabled).toBe(true)

        // Checking declaration enables submit
        const checkbox = screen.getByRole('checkbox')
        act(() => {
          checkbox.click()
        })
        expect((submitBtn as HTMLButtonElement).disabled).toBe(false)

        act(() => {
          submitBtn.click()
        })
        expect(onSubmit).toHaveBeenCalled()
      })
    })
  })
})


