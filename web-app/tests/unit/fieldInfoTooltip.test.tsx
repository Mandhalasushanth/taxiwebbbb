// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FieldInfoTooltip } from '@shared/components'
import { GSTBusinessIdentitySection } from '../../src/modules/gst/components/GSTRegistration/GSTBusinessDetails/GSTBusinessGeneralSection'
import { GSTBusinessAddressSection } from '../../src/modules/gst/components/GSTRegistration/GSTBusinessDetails/GSTBusinessAddressSection'
import { GSTPeriodFields } from '../../src/modules/gst/components/GSTFiling/GSTFilingPeriod/GSTPeriodFields'
import { GSTCompliance } from '../../src/modules/gst/components/GSTCompliance/GSTCompliance'
import { GSTNoticeResponseFields } from '../../src/modules/gst/shared/GSTComplianceCard/GSTNoticeResponseFields'
import { GSTAmendmentSelection } from '../../src/modules/gst/components/GSTAmendment/GSTAmendmentSelection/GSTAmendmentSelection'
import {
  ItrSalaryIncomeCard,
  ItrHousePropertyCard,
} from '../../src/modules/itr/components/ItrFiling/IncomeSources/ItrSalaryHouseCards'
import { ItrBusinessIncomeCard } from '../../src/modules/itr/components/ItrFiling/IncomeSources/ItrBusinessIncomeCard'
import {
  ItrCapitalGainsCard,
  ItrOtherSourcesCard,
} from '../../src/modules/itr/components/ItrFiling/IncomeSources/ItrIncomeSourceCards'

afterEach(() => {
  cleanup()
})

describe('FieldInfoTooltip Component', () => {
  it('renders trigger button with accessible label and aria-expanded=false initially', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('supports custom ariaLabel prop', () => {
    render(
      <FieldInfoTooltip
        title="Custom Field"
        description="Custom description"
        ariaLabel="Custom field help"
      />
    )

    const trigger = screen.getByRole('button', { name: 'Custom field help' })
    expect(trigger).toBeInTheDocument()
  })

  it('opens popup when clicking trigger icon, displaying title and description', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Test Field Information')).toBeInTheDocument()
    expect(screen.getByText('This is a test description for the field.')).toBeInTheDocument()
  })

  it('closes popup when clicking trigger icon again (toggle)', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes popup when clicking the close (X) button', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)

    const closeBtn = screen.getByRole('button', { name: /Close/i })
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes popup on click outside', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <FieldInfoTooltip
          title="Test Field Information"
          description="This is a test description for the field."
        />
      </div>
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside-element'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes popup when pressing Escape key', () => {
    render(
      <FieldInfoTooltip
        title="Test Field Information"
        description="This is a test description for the field."
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('GST Module - FieldInfoTooltip Integration Across Specified Fields', () => {
  it('1. GST Registration: renders Trade Name Information tooltip with exact required copy', () => {
    render(
      <GSTBusinessIdentitySection
        data={{
          legalName: '',
          tradeName: '',
          constitution: '',
          businessPan: '',
          natureOfBusiness: '',
          commencementDate: '',
          registrationReason: '',
          compositionScheme: 'No',
        }}
        onChange={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('Trade Name Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the trade name under which your business operates. It should match the trade name used in your GST registration details, if applicable.'
      )
    ).toBeInTheDocument()
  })

  it('2. GST Registration: renders SAC Code Information tooltip with exact required copy', () => {
    render(
      <GSTBusinessAddressSection
        data={{
          placeOfBusiness: '',
          businessAddress: '',
          city: '',
          district: '',
          state: '',
          pinCode: '',
          hsnSacCode: '',
        }}
        onChange={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('SAC Code Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the appropriate Service Accounting Code (SAC) applicable to the services provided by your business. Ensure the code matches the nature of your services.'
      )
    ).toBeInTheDocument()
  })

  it('3. GST Filing: renders GSTIN Information tooltip on GSTIN (15-Character) field', () => {
    render(
      <GSTPeriodFields
        frequency="monthly"
        financialYear="2025-26"
        setFinancialYear={vi.fn()}
        returnPeriod="2025-04"
        setReturnPeriod={vi.fn()}
        periodOptions={[]}
        filingType="regular"
        setFilingType={vi.fn()}
        calculationMethod="manual"
        setCalculationMethod={vi.fn()}
        estimatedSales=""
        setEstimatedSales={vi.fn()}
        estimatedPurchases=""
        setEstimatedPurchases={vi.fn()}
        estimatedItc=""
        setEstimatedItc={vi.fn()}
        gstin=""
        setGstin={vi.fn()}
        returnType="gstr1"
        setReturnType={vi.fn()}
        errors={{}}
        handleClearError={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('GSTIN Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter your valid 15-digit GST Identification Number. Ensure it matches your GST registration.'
      )
    ).toBeInTheDocument()
  })

  it('4. GST Compliance: renders GSTIN Information tooltip on GSTIN field', () => {
    render(
      <MemoryRouter>
        <GSTCompliance />
      </MemoryRouter>
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('GSTIN Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the valid 15-digit GST Identification Number associated with the GST registration for which you want to manage compliance.'
      )
    ).toBeInTheDocument()
  })

  it('5. GST Compliance: renders Notice Number Information tooltip on Notice Number field', () => {
    render(
      <GSTNoticeResponseFields
        values={{
          noticeNumber: '',
          issueDate: '',
          dueDate: '',
          additionalInfo: '',
        }}
        errors={{}}
        onChange={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('Notice Number Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the notice or reference number mentioned in the GST notice issued by the GST department. Ensure the number matches the official notice.'
      )
    ).toBeInTheDocument()
  })

  it('6. GST Amendment: renders GSTIN to Amend Information tooltip on GSTIN to Amend field', () => {
    render(
      <GSTAmendmentSelection
        gstin=""
        onGstinChange={vi.fn()}
        onSelectOption={vi.fn()}
      />
    )

    const trigger = screen.getByRole('button', { name: /Field information/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('GSTIN to Amend Information')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter the 15-digit GSTIN of the existing GST registration for which you want to request an amendment. Ensure you select the correct registration.'
      )
    ).toBeInTheDocument()
  })
})

describe('GST Registration - Primary HSN / SAC Code Classification Badge', () => {
  const baseData = {
    placeOfBusiness: '',
    businessAddress: '',
    city: '',
    district: '',
    state: '',
    pinCode: '',
    hsnSacCode: '',
  }

  it('displays "✓ HSN (Goods) — 4 digits" when a valid 4-digit HSN code is entered', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '1234' }}
        onChange={vi.fn()}
      />
    )
    const badge = screen.getByTestId('gst-hsn-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('✓ HSN (Goods) — 4 digits')
  })

  it('displays "✓ HSN (Goods) — 6 digits" when a valid 6-digit HSN code is entered', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '123455' }}
        onChange={vi.fn()}
      />
    )
    const badge = screen.getByTestId('gst-hsn-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('✓ HSN (Goods) — 6 digits')
  })

  it('displays "✓ HSN (Goods) — 8 digits" when a valid 8-digit HSN code is entered', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '12345555' }}
        onChange={vi.fn()}
      />
    )
    const badge = screen.getByTestId('gst-hsn-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('✓ HSN (Goods) — 8 digits')
  })

  it('displays "✓ SAC (Services) — 6 digits" when a valid 6-digit SAC code is entered', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '998311' }}
        onChange={vi.fn()}
      />
    )
    const badge = screen.getByTestId('gst-hsn-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('✓ SAC (Services) — 6 digits')
  })

  it('does not display badge for invalid, incomplete, or non-6-digit SAC codes', () => {
    const { rerender } = render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '123' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId('gst-hsn-badge')).not.toBeInTheDocument()

    rerender(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '9983' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId('gst-hsn-badge')).not.toBeInTheDocument()

    rerender(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '0012' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId('gst-hsn-badge')).not.toBeInTheDocument()
  })

  it('does not display badge when there is an explicit field error', () => {
    render(
      <GSTBusinessAddressSection
        data={{ ...baseData, hsnSacCode: '1234' }}
        errors={{ hsnSacCode: 'Invalid HSN' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.queryByTestId('gst-hsn-badge')).not.toBeInTheDocument()
    expect(screen.getByText('Invalid HSN')).toBeInTheDocument()
  })

  describe('ITR Filing - Salary Income Card-Level Info Tooltip', () => {
    const mockSalaryDetails = {
      employerName: 'Infosys Limited',
      grossSalary: '1200000',
      exemptAllowances: '150000',
      tdsDeducted: '45000',
    }

    it('renders exactly one info icon for the whole card beside the Salary Income title', () => {
      render(
        <ItrSalaryIncomeCard
          salaryDetails={mockSalaryDetails}
          onSalaryDetailsChange={vi.fn()}
          onToggle={vi.fn()}
        />
      )

      // Exactly 1 info button across the entire Salary Income card
      const infoButtons = screen.getAllByRole('button', { name: /Salary Income field guide/i })
      expect(infoButtons).toHaveLength(1)

      const trigger = infoButtons[0]
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      // The title and all form field labels with asterisks are present
      expect(screen.getByRole('heading', { name: 'Salary Income' })).toBeInTheDocument()
      expect(screen.getByLabelText(/Employer Legal Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Gross Salary \(Annual\)/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Exempt Allowances/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/TDS Deducted by Employer/i)).toBeInTheDocument()
    })

    it('opens dialog with consolidated field info for all salary fields in one place', () => {
      render(
        <ItrSalaryIncomeCard
          salaryDetails={mockSalaryDetails}
          onSalaryDetailsChange={vi.fn()}
          onToggle={vi.fn()}
        />
      )

      const trigger = screen.getByRole('button', { name: /Salary Income field guide/i })
      fireEvent.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()

      // Dialog title
      expect(screen.getByText('Salary Income Information')).toBeInTheDocument()

      // Single narrative guidance matching the UI mockup
      expect(dialog).toHaveTextContent('Enter your total salary (before deductions)')
      expect(dialog).toHaveTextContent('any tax-exempt allowances (e.g., HRA, LTA)')
      expect(dialog).toHaveTextContent('and TDS deducted by your employer.')

      // Clicking close button dismisses the popup
      const closeBtn = screen.getByRole('button', { name: /Close/i })
      fireEvent.click(closeBtn)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('ITR Filing - Other Income Cards-Level Info Tooltips', () => {
    it('House Property card renders single info icon and opens consolidated field guide', () => {
      render(
        <ItrHousePropertyCard
          housePropertyDetails={{
            propertyType: 'self_occupied',
            homeLoanInterest: '150000',
            annualRentReceived: '',
            municipalTaxPaid: '',
          }}
          onHousePropertyDetailsChange={vi.fn()}
          onToggle={vi.fn()}
        />
      )

      const trigger = screen.getByRole('button', { name: /Property income field guide/i })
      expect(trigger).toBeInTheDocument()
      fireEvent.click(trigger)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('House Property Information')).toBeInTheDocument()
      expect(dialog).toHaveTextContent('Provide details of your house property')
      expect(dialog).toHaveTextContent('whether it is self-occupied or rented')
    })

    it('House Property card renders mandatory stars on all fields and swaps rent/tax before loan interest for let-out', () => {
      const { rerender } = render(
        <ItrHousePropertyCard
          housePropertyDetails={{
            propertyType: 'let_out',
            homeLoanInterest: '120000',
            annualRentReceived: '300000',
            municipalTaxPaid: '20000',
          }}
          onHousePropertyDetailsChange={vi.fn()}
          onToggle={vi.fn()}
        />
      )

      expect(screen.getByText(/Property Classification/i)).toBeInTheDocument()
      expect(screen.getByText(/Annual Rent Received/i)).toBeInTheDocument()
      expect(screen.getByText(/Municipal Tax Paid/i)).toBeInTheDocument()
      expect(screen.getByText(/Home Loan Interest Paid \(Sec 24b\)/i)).toBeInTheDocument()

      const rentInput = screen.getByPlaceholderText('Enter annual rent received')
      const taxInput = screen.getByPlaceholderText('Enter municipal tax paid')
      const loanInput = screen.getByPlaceholderText('Enter home loan interest')

      // Annual Rent Received & Municipal Tax Paid are before Home Loan Interest in the DOM tree
      expect(rentInput.compareDocumentPosition(loanInput) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(taxInput.compareDocumentPosition(loanInput) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

      // When self_occupied, only Property Classification and Home Loan Interest are shown
      rerender(
        <ItrHousePropertyCard
          housePropertyDetails={{
            propertyType: 'self_occupied',
            homeLoanInterest: '120000',
            annualRentReceived: '',
            municipalTaxPaid: '',
          }}
          onHousePropertyDetailsChange={vi.fn()}
          onToggle={vi.fn()}
        />
      )
      expect(screen.queryByPlaceholderText('Enter annual rent received')).toBeNull()
      expect(screen.getByPlaceholderText('Max ₹2,00,000 for self-occupied')).toBeInTheDocument()
    })

    it('Business / Profession card renders single info icon and opens consolidated field guide', () => {
      render(
        <ItrBusinessIncomeCard
          businessDetails={{
            reportingMethod: '44ad',
            turnover: '2500000',
            presumptiveRate: '6',
            natureOfBusiness: 'Retail trade',
          }}
          onBusinessDetailsChange={vi.fn()}
          onToggle={vi.fn()}
        />
      )

      expect(screen.getByText(/How do you report this business\?/i)).toBeInTheDocument()
      expect(screen.getByText('Gross Turnover')).toBeInTheDocument()
      expect(screen.getByText('Declared Profit')).toBeInTheDocument()

      const trigger = screen.getByRole('button', { name: /Commercial and professional income guide/i })
      expect(trigger).toBeInTheDocument()
      fireEvent.click(trigger)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Business / Profession Information')).toBeInTheDocument()
      expect(dialog).toHaveTextContent('Choose how you report your business income')
      expect(dialog).toHaveTextContent('declared net profit')
    })

    it('Capital Gains & Trading card renders single info icon and opens consolidated field guide', () => {
      render(
        <ItrCapitalGainsCard
          capitalGainsDetails={{
            assetTypes: ['Equity Shares & Equity Mutual Funds'],
            stcg: '50000',
            ltcg: '120000',
          }}
          onCapitalGainsDetailsChange={vi.fn()}
          onToggle={vi.fn()}
        />
      )

      const trigger = screen.getByRole('button', { name: /Trading and asset gains field guide/i })
      expect(trigger).toBeInTheDocument()
      fireEvent.click(trigger)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Capital Gains & Trading Information')).toBeInTheDocument()
      expect(dialog).toHaveTextContent('Enter details of your gains or profits from stocks')
      expect(dialog).toHaveTextContent('assets held ≤ 12 months')
    })

    it('Other Sources card renders single info icon and opens consolidated field guide', () => {
      render(
        <ItrOtherSourcesCard
          otherSourcesDetails={{
            savingsInterest: '10000',
            fdInterest: '25000',
            dividendIncome: '5000',
            familyPension: '0',
            otherMiscellaneous: '0',
          }}
          onOtherSourcesDetailsChange={vi.fn()}
          onToggle={vi.fn()}
        />
      )

      expect(screen.getByRole('heading', { name: 'Income from Other Sources' })).toBeInTheDocument()
      expect(screen.getByText('Bank interest, dividends, family pension')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 10000 (0 if none)')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 25000 (0 if none)')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. 5000 (0 if none)')).toBeInTheDocument()
      expect(screen.getAllByPlaceholderText('e.g. 0 if none')).toHaveLength(2)

      const trigger = screen.getByRole('button', { name: /Savings, interest and misc income guide/i })
      expect(trigger).toBeInTheDocument()
      fireEvent.click(trigger)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Other Sources Information')).toBeInTheDocument()
      expect(dialog).toHaveTextContent('Enter other income received during the financial year')
      expect(dialog).toHaveTextContent('Enter 0 if none')
    })
  })
})